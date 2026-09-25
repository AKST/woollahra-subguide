/**
 * End-to-end checks in a real browser: `npm run test:e2e`.
 * Needs Playwright's Chromium (`npx playwright install chromium` the first time).
 * Completed PDFs and screenshots are written to test-output/ for a visual check.
 */
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { chromium, webkit } from 'playwright';
import { createServer, preview } from 'vite';
import { PDFDocument, PDFName, PDFDict } from 'pdf-lib';

const OUT = new URL('../test-output/', import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

let originUnavailable = false;
const server = await preview({
  plugins: [
    {
      name: 'test-origin-outage',
      configurePreviewServer(server) {
        server.middlewares.use((_request, response, next) => {
          if (originUnavailable) response.destroy();
          else next();
        });
      },
    },
  ],
  base: '/unsorted/20260925/',
  preview: { host: '127.0.0.1', port: 0, open: false },
});
let BASE = `http://127.0.0.1:${server.httpServer.address().port}/unsorted/20260925/`;
let browser;
try {
  browser =
    process.env.TEST_BROWSER === 'webkit'
      ? await webkit.launch({ executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE })
      : await chromium.launch({
          args: ['--host-resolver-rules=MAP woollahra.test 127.0.0.1', '--no-proxy-server'],
        });
} catch (error) {
  await new Promise(resolve => server.httpServer.close(resolve));
  throw error;
}
let failures = 0;

async function test(name, fn, { width = 400, allowedExternalRequests = [] } = {}) {
  if (process.argv[2] && !new RegExp(process.argv[2]).test(name)) return;
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
    acceptDownloads: true,
    timezoneId: 'Australia/Sydney',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.clock.setFixedTime(new Date('2026-09-25T02:00:00Z'));
  const externalRequests = [];
  page.on('request', request => {
    if (!request.url().startsWith(BASE) && /^https?:/.test(request.url()))
      externalRequests.push(request.url());
  });
  const errors = [];
  const failedRequests = [];
  page.on('requestfailed', request =>
    failedRequests.push({ url: request.url(), error: request.failure()?.errorText }),
  );
  page.on('pageerror', e => errors.push(e.message));
  try {
    await fn(page);
    assert.deepEqual(errors, [], 'page errors');
    assert.deepEqual(
      externalRequests.filter(url => !allowedExternalRequests.includes(url)),
      [],
      'no unexpected external requests',
    );
    console.log(`✓ ${name}`);
  } catch (err) {
    failures++;
    console.log(`✗ ${name}\n  ${err.stack}`);
    if (errors.length) console.log(errors);
    if (failedRequests.length) console.log(failedRequests);
    await page.screenshot({
      path: `${OUT}failed-${name.replace(/\W+/g, '-')}.png`,
      fullPage: true,
    });
  } finally {
    originUnavailable = false;
    await context.close();
  }
}

const next = page => page.click('#nextButton');
const onStep = (page, n) => page.waitForSelector(`section[data-step="${n}"]:not([hidden])`);

await test('reduced motion follows the system and URL override with static effects and instant header resizing', async page => {
  const assertStill = async () => {
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('#progress sup')).every(element =>
        getComputedStyle(element).opacity === '0'),
    );
    const effects = await page.evaluate(() => ({
      animations: document.getAnimations().filter(animation => animation.playState === 'running').length,
      layers: Array.from(document.querySelectorAll('h1 > [aria-hidden="true"]'), element =>
        getComputedStyle(element).display),
      questionOpacity: Array.from(document.querySelectorAll('#progress sup'), element =>
        getComputedStyle(element).opacity),
    }));
    assert.equal(effects.animations, 0);
    assert.deepEqual(effects.layers, ['none', 'none', 'none']);
    assert.deepEqual(effects.questionOpacity, ['0']);
    assert.equal(await page.locator('#progress sup:visible').count(), 0);
    assert.equal(await page.locator('#progress sup').evaluate(element =>
      element.parentElement.firstChild.textContent), 'Your Details');
    await page.getByRole('button', { name: 'Toggle accent theme' }).hover();
    assert.deepEqual(await page.locator('h1 > [aria-hidden="true"]').evaluateAll(elements =>
      elements.map(element => getComputedStyle(element).transform)), ['none', 'none', 'none']);
    await page.locator('#formContent').evaluate(element => { element.scrollTop = 0; });
    await page.waitForTimeout(50);
    const before = await page.locator('header').boundingBox();
    await page.locator('#formContent').evaluate(element => { element.scrollTop = 200; });
    await page.waitForTimeout(300);
    const after = await page.locator('header').boundingBox();
    const step = await page.locator('[data-layout-frozen]').getAttribute('data-step');
    if (page.viewportSize().width > 700 && Number(step) <= 1) {
      assert.ok(after.height < before.height, 'header collapses on scroll in reduced motion');
      await page.locator('#formContent').evaluate(element => { element.scrollTop = 0; });
      await page.waitForTimeout(50);
      assert.equal((await page.locator('header').boundingBox()).height, before.height,
        'header expands again at the top');
    } else {
      assert.equal(after.height, before.height, 'later steps and mobile keep their header size');
    }
    assert.equal(await page.locator('header').evaluate(element => getComputedStyle(element).transitionDuration), '0s');
    await page.getByRole('button', { name: 'Toggle accent theme' }).click();
    assert.equal(await page.locator('h1 > [aria-hidden="true"]:visible').count(), 0);
    assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.playState === 'running').length), 0);
  };

  for (const width of [400, 1200]) {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${BASE}#?page=about&reducedMotion=true`);
    await onStep(page, 0);
    assert.ok((await page.locator('#progress a').evaluateAll(links => links.map(a => a.hash)))
      .every(hash => hash.includes('&reducedMotion=true')));
    assert.ok((await page.locator('#sendLink').getAttribute('href')).includes('&reducedMotion=true'));
    await assertStill();
    await page.locator('#progress a[href="#?page=signature&reducedMotion=true"]').click();
    await onStep(page, 2);
    assert.equal(new URLSearchParams(new URL(page.url()).hash.slice(2)).get('reducedMotion'), 'true');
    await page.goBack();
    await onStep(page, 0);
    assert.ok(page.url().endsWith('#?page=about&reducedMotion=true'));
    await page.goForward();
    await onStep(page, 2);
    await page.reload();
    await onStep(page, 2);
    await assertStill();

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${BASE}#?reducedMotion=false`);
    await onStep(page, 1);
    await assertStill();
  }
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(BASE);
  await onStep(page, 1);
  assert.equal(await page.locator('h1 > [aria-hidden="true"]:visible').count(), 3);
  assert.ok(await page.evaluate(() => document.getAnimations().some(a => a.playState === 'running')));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await assertStill();
}, { width: 1200 });

async function openRegistration(page, url = BASE) {
  await page.goto(url);
  await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
}

await test('Fix buttons keep the target field visible without scrolling the desktop document', async page => {
  for (const width of [1200, 400]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${BASE}#?page=details`);
    await onStep(page, 1);
    for (const [label, key, step] of [
      ['Full name', 'fullName', 1],
      ['Address', 'address', 1],
      ['Signature', 'signature', 2],
    ]) {
      await page.getByRole('link', { name: 'Download', exact: true }).click();
      await onStep(page, 4);
      await page.locator('#issuesList li').filter({ has: page.locator('strong', { hasText: label }) })
        .getByRole('button', { name: 'Fix', exact: true }).click();
      await onStep(page, step);
      await page.waitForTimeout(400);
      const position = await page.locator(`[data-field="${key}"]`).evaluate(field => {
        const rect = field.getBoundingClientRect();
        const content = document.querySelector('#formContent').getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, contentTop: content.top, contentBottom: content.bottom,
          windowY: scrollY, focused: field.contains(document.activeElement) };
      });
      assert.ok(position.focused, `${label} receives focus`);
      if (width > 700) assert.equal(position.windowY, 0, `${label}: only the content pane should scroll`);
      const top = width > 700 ? Math.max(0, position.contentTop) : 0;
      const bottom = width > 700 ? Math.min(900, position.contentBottom) : 900;
      assert.ok(position.top >= top && position.bottom <= bottom,
        `${label} is visible at ${width}px: ${JSON.stringify(position)}`);
    }
  }
}, { width: 1200 });

async function assertPreviewPlacement(page) {
  await page.waitForFunction(() =>
    [...document.querySelectorAll('[data-sheet]')].every(
      sheet =>
        Math.abs(
          Number(getComputedStyle(sheet).getPropertyValue('--k')) - sheet.clientWidth / 595.56,
        ) < 0.001,
    ),
  );
  const answers = await page.locator('[data-kind]').evaluateAll(elements =>
    elements.map(element => {
      const sheet = element.closest('[data-sheet]');
      const pageRect = sheet.getBoundingClientRect();
      const answerRect = element.getBoundingClientRect();
      const scale = sheet.clientWidth / 595.56;
      const artwork = element.querySelector('svg, img')?.getBoundingClientRect();
      return {
        id: element.dataset.id,
        position: getComputedStyle(element).position,
        x: answerRect.left - pageRect.left,
        y: answerRect.top - pageRect.top,
        expectedX: Number(element.style.getPropertyValue('--x')) * scale,
        expectedY: Number(element.style.getPropertyValue('--y')) * scale,
        width: artwork?.width,
        height: artwork?.height,
        expectedWidth: Number(element.style.getPropertyValue('--w')) * scale,
        expectedHeight: Number(element.style.getPropertyValue('--h')) * scale,
      };
    }),
  );
  assert.ok(answers.length > 0, 'preview contains answers');
  for (const answer of answers) {
    assert.equal(answer.position, 'absolute', `${answer.id} overlays its form page`);
    assert.ok(
      Math.abs(answer.x - answer.expectedX) < 1,
      `${answer.id}: actual x ${answer.x}, expected ${answer.expectedX}`,
    );
    assert.ok(
      Math.abs(answer.y - answer.expectedY) < 1,
      `${answer.id}: actual y ${answer.y}, expected ${answer.expectedY}`,
    );
    if (answer.width != null) {
      assert.ok(Math.abs(answer.width - answer.expectedWidth) < 1, `${answer.id}: artwork width`);
      assert.ok(
        Math.abs(answer.height - answer.expectedHeight) < 1,
        `${answer.id}: artwork height`,
      );
    }
  }
}

async function download(page, file) {
  const originalUrl = page.url();
  assert.equal(
    await page.getAttribute('#downloadLink', 'target'),
    null,
    'PDF link retains the original same-tab behaviour',
  );
  await page.getByText('Remember to attach the form', { exact: true }).waitFor();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#downloadLink')]);
  await dl.saveAs(`${OUT}${file}`);
  assert.equal(page.url(), originalUrl, 'downloading preserves the registration page');
  const pdf = await PDFDocument.load(await readFile(`${OUT}${file}`));
  assert.equal(pdf.getPageCount(), 2, 'both form pages are present');
  assert.equal(pdf.getForm().getFields().length, 0, 'original fillable fields are removed');
  return dl.suggestedFilename();
}

await test('complete every step with a drawn signature', async page => {
  const item =
    'DA 412/2025 – 2-4 Cross Street, Double Bay – six storey mixed use building with 42 apartments';
  await openRegistration(
    page,
    `${BASE}?date=2026-10-14&mode=person&item=${encodeURIComponent(item)}`,
  );
  assert.equal(await page.inputValue('#reportTitle'), item, 'report title from URL');

  await onStep(page, 1);
  await page.fill('#honorific', 'Mr');
  await page.fill('#fullName', 'Angus Citizen-Hernández');
  await page.fill('#address', '12 Example Street, Double Bay NSW 2028');
  await page.fill('#phone', '0400 123 456');
  await page.fill('#email', 'angus@example.com');

  await onStep(page, 1);
  await page.check('input[name=rep][value=yes]', { force: true });
  await page.fill('#repDetails', 'Sydney YIMBY Inc. and residents of the Double Bay centre');

  await next(page);
  await onStep(page, 2);
  await page.check('#accept');
  await page.click('#tabDraw');
  await page.locator('#sigCanvas').scrollIntoViewIfNeeded();
  const pad = await page.locator('#sigCanvas').boundingBox();
  await page.mouse.move(pad.x + 30, pad.y + 100);
  await page.mouse.down();
  for (let i = 0; i <= 40; i++)
    await page.mouse.move(pad.x + 30 + i * 6, pad.y + 100 - 30 * Math.sin(i / 4));
  await page.mouse.up();

  await next(page);
  await onStep(page, 3);
  await page.waitForSelector('[data-kind]');
  await assertPreviewPlacement(page);
  assert.equal(
    await page.locator('[data-kind][data-overflow="true"]').count(),
    0,
    'nothing overflows its box',
  );

  const signature = page.locator('[data-kind="image"][data-id="signature"]');
  const size = () =>
    signature.evaluate(element => ({
      width: Number(element.style.getPropertyValue('--w')),
      height: Number(element.style.getPropertyValue('--h')),
    }));
  await signature.scrollIntoViewIfNeeded();
  const originalSignature = await size();
  const signatureBox = await signature.boundingBox();
  const handle = await signature.locator('[data-resize-handle]').boundingBox();
  assert.ok(handle.width >= 44 && handle.height >= 44, 'generous signature resize target');
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    handle.x + handle.width / 2 + signatureBox.width / 2,
    handle.y + handle.height / 2,
    { steps: 12 },
  );
  await page.mouse.up();
  const enlargedSignature = await size();
  assert.ok(Math.abs(enlargedSignature.width / originalSignature.width - 1.5) < 0.03);
  assert.ok(
    Math.abs(
      enlargedSignature.width / enlargedSignature.height -
        originalSignature.width / originalSignature.height,
    ) < 0.01,
  );
  assert.ok(!(await page.locator('#editorStatus').innerText()).includes('outside'));
  const slider = page.getByRole('slider', { name: 'Signature size' });
  await slider.focus();
  await slider.press('End');
  assert.ok(Math.abs((await size()).width / originalSignature.width - 3) < 0.01);
  assert.ok(!(await signature.getAttribute('aria-label')).includes('outside'));
  await page.click('#toolReset');
  assert.ok(Math.abs((await size()).width - originalSignature.width) < 0.01);
  await slider.focus();
  await slider.press('ArrowRight');
  assert.ok((await size()).width > originalSignature.width);

  // Drag the phone number 20pt right, measuring the rendered PDF-point position.
  const phone = page.locator('[data-kind][data-id="phone"]');
  await phone.evaluate(element => element.scrollIntoView({ block: 'center' }));
  const initialX = await phone.evaluate(element => Number(element.style.getPropertyValue('--x')));
  const box = await phone.boundingBox();
  const k = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector('[data-sheet]')).getPropertyValue('--k')),
  );
  await page.mouse.move(box.x + 5, box.y + 3);
  await page.mouse.down();
  await page.mouse.move(box.x + 5 + 20 * k, box.y + 3, { steps: 8 });
  await page.mouse.up();
  const movedX = await phone.evaluate(element => Number(element.style.getPropertyValue('--x')));
  assert.ok(Math.abs(movedX - initialX - 20) < 0.5, `phone moved 20pt (got ${movedX - initialX})`);
  await assertPreviewPlacement(page);
  await page.screenshot({ path: `${OUT}step3.png`, fullPage: true });

  await next(page);
  await onStep(page, 4);
  assert.ok(await page.locator('#issues').isHidden(), 'no missing answers');
  assert.match(
    await page.getAttribute('#emailLink', 'href'),
    /^mailto:records@woollahra\.nsw\.gov\.au\?subject=/,
  );
  const emailUrl = new URL(await page.getAttribute('#emailLink', 'href'));
  assert.equal(emailUrl.searchParams.has('body'), false, 'no prefilled email body when disabled');
  assert.ok(
    emailUrl.searchParams.get('subject').includes(item),
    'subject includes the speaking item',
  );
  assert.equal(
    await page.locator('#emailSubject').innerText(),
    emailUrl.searchParams.get('subject'),
  );
  assert.equal(await page.locator('#emailBody').count(), 0);
  assert.equal(await page.getByText('Preview email', { exact: true }).count(), 0);
  assert.equal(await page.getByRole('button', { name: 'Copy message' }).count(), 0);
  const name = await download(page, 'complete.pdf');
  assert.equal(name, 'Public-forum-registration_Citizen-Hernandez_2026-10-14.pdf');
  await page.screenshot({ path: `${OUT}step4.png`, fullPage: true });

  await page.goBack();
  await onStep(page, 3);
  await assertPreviewPlacement(page);
});

await test('skip every step with a typed signature', async page => {
  await openRegistration(page, BASE);
  const meetingDate = await page.inputValue('#meetingDate');
  await next(page);
  await onStep(page, 2);
  await page.click('#tabType');
  await page.fill('#sigTyped', 'Jane Citizen');
  await page.click('[data-font="delafield"]');
  await next(page);
  await onStep(page, 3);
  await assertPreviewPlacement(page);
  await next(page);
  await onStep(page, 4);

  const issues = await page.locator('#issuesList li').count();
  assert.ok(issues >= 6, `lists missing answers (got ${issues})`);
  assert.equal(
    await download(page, 'incomplete.pdf'),
    `${['Public-forum-registration', meetingDate].filter(Boolean).join('_')}.pdf`,
    'still downloads',
  );

  // "Fix" goes to the right step and flags the field.
  await page.click('#issuesList li:has-text("Full name") button');
  await onStep(page, 1);
  assert.equal(await page.evaluate(() => document.activeElement.id), 'fullName');
  assert.ok(await page.locator('#fullName[aria-invalid="true"]').isVisible(), 'field is flagged');
  await page.fill('#fullName', 'Jane Citizen');
  assert.equal(
    await page.locator('#fullName[aria-invalid="true"]').count(),
    0,
    'flag clears when typing',
  );
});

await test(
  'validation keeps neighbouring labels and inputs aligned',
  async page => {
    await openRegistration(page, BASE);
    const assertAligned = async () => {
      for (const [left, right] of [
        ['honorific', 'fullName'],
        ['phone', 'email'],
      ]) {
        const boxes = await page.evaluate(
          ([first, second]) =>
            [first, second].map(id => {
              const input = document.getElementById(id).getBoundingClientRect();
              const label = document.querySelector(`label[for="${id}"]`).getBoundingClientRect();
              return { inputTop: input.top, inputHeight: input.height, labelTop: label.top };
            }),
          [left, right],
        );
        assert.ok(
          Math.abs(boxes[0].labelTop - boxes[1].labelTop) < 1,
          `${left}/${right} labels align`,
        );
        assert.ok(
          Math.abs(boxes[0].inputTop - boxes[1].inputTop) < 1,
          `${left}/${right} inputs align`,
        );
        assert.ok(
          Math.abs(boxes[0].inputHeight - boxes[1].inputHeight) < 1,
          `${left}/${right} input heights match`,
        );
      }
    };
    await page.waitForSelector('#fullName');
    await assertAligned();
    await page.click('#sendLink');
    await onStep(page, 4);
    await page.click('#issuesList li:has-text("Full name") button');
    await onStep(page, 1);
    await page.locator('#fullName[aria-invalid=true]').waitFor();
    await assertAligned();
    await page.fill('#phone', '0400 123 456');
    assert.equal(await page.locator('#phoneMessage').innerText(), '');
    assert.ok((await page.locator('#emailMessage').innerText()).length > 0);
    await assertAligned();
    await page.setViewportSize({ width: 600, height: 900 });
    await assertAligned();
  },
  { width: 1280 },
);

await test('nothing is kept after a refresh', async page => {
  await openRegistration(page, BASE);
  const prefill = {
    title: await page.inputValue('#reportTitle'),
    date: await page.inputValue('#meetingDate'),
  };
  if ((await page.getAttribute('#agendaToggle', 'aria-expanded')) === 'false')
    await page.click('#agendaToggle');
  assert.equal(
    await page.getByRole('button', { name: 'Prefill demo' }).count(),
    0,
    'no development tools in production',
  );
  await page.fill('#reportTitle', 'Test item');
  await page.fill('#meetingDate', '2026-10-20');
  await page.fill('#fullName', 'Jane Citizen');
  await page.fill('#email', 'jane@example.com');
  await page.reload();
  await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
  const state = await page.evaluate(() => ({
    title: document.getElementById('reportTitle').value,
    date: document.getElementById('meetingDate').value,
    name: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    localStorage: localStorage.length,
    sessionStorage: sessionStorage.length,
    cookies: document.cookie,
  }));
  assert.deepEqual(state, {
    ...prefill,
    name: '',
    email: '',
    localStorage: 0,
    sessionStorage: 0,
    cookies: '',
  });
});

await test(
  'preview keyboard controls, resizing, and reset',
  async page => {
    await openRegistration(page, BASE);
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await onStep(page, 1);
    await page.fill('#fullName', 'Jane Citizen');
    await page.fill('#phone', '0400 123 456');
    await page.getByRole('link', { name: 'Check on form', exact: true }).click();
    await onStep(page, 3);
    await assertPreviewPlacement(page);
    const phone = page.locator('[data-kind][data-id="phone"]');
    const position = () =>
      phone.evaluate(element => ({
        x: Number(element.style.getPropertyValue('--x')),
        y: Number(element.style.getPropertyValue('--y')),
        size: Number(element.style.getPropertyValue('--size')),
      }));
    const initial = await position();
    await phone.focus();
    await phone.press('ArrowRight');
    await phone.press('Shift+ArrowDown');
    assert.deepEqual(await position(), { ...initial, x: initial.x + 0.5, y: initial.y + 5 });
    await page.click('#toolLarger');
    assert.ok((await position()).size > initial.size);
    await page.click('#toolReset');
    assert.deepEqual(await position(), initial);
    assert.ok(await page.isDisabled('#toolReset'));
    await page.click('#toolZoom');
    assert.equal(await page.getAttribute('#toolZoom', 'aria-pressed'), 'true');
    await phone.focus();
    await phone.press('ArrowLeft');
    await page.click('#toolResetAll');
    assert.deepEqual(await position(), initial);
    await page.screenshot({ path: `${OUT}desktop-preview.png`, fullPage: true });
    await assertPreviewPlacement(page);
    await page.setViewportSize({ width: 400, height: 900 });
    await assertPreviewPlacement(page);
  },
  { width: 1200 },
);

await test('missing-fields privacy popover supports keyboard and fits desktop and mobile', async page => {
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await openRegistration(page, BASE);
    await page.click('#sendLink');
    await onStep(page, 4);
    const trigger = page.getByRole('button', { name: /^If you prefer/ });
    assert.equal(await trigger.evaluate(element => getComputedStyle(element).display), 'inline');
    if (width === 320)
      assert.ok(
        await trigger.evaluate(element => element.getClientRects().length > 1),
        'popup text wraps across lines',
      );
    const note = page.locator('section[data-step="4"] [popover]');
    await note.waitFor({ state: 'hidden' });
    await trigger.click();
    await note.waitFor({ state: 'visible' });
    assert.equal(
      await note.innerText(),
      'Note, just to be clear, your data never leaves your device. I never see it, but I also understand you have to take what I say at face value.',
    );
    await page.waitForFunction(
      () => document.querySelector('section[data-step="4"] [popover]').style.left !== '',
    );
    const rect = await note.boundingBox();
    assert.ok(rect.x >= 0 && rect.x + rect.width <= width);
    assert.ok(rect.y >= 0 && rect.y + rect.height <= 900);
    await trigger.click();
    await note.waitFor({ state: 'hidden' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await note.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await note.waitFor({ state: 'hidden' });
    await trigger.focus();
    await page.keyboard.press('Space');
    await note.waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await note.waitFor({ state: 'hidden' });
    await trigger.click();
    await note.waitFor({ state: 'visible' });
    await page.locator('#step4Title').click();
    await note.waitFor({ state: 'hidden' });
  }
});

await test('empty form still downloads and a failed PDF load can be retried', async page => {
  await openRegistration(page, BASE);
  await page.route('**/assets/form.pdf', route =>
    route.fulfill({ status: 503, body: 'Unavailable' }),
  );
  await page.click('#sendLink');
  await page.waitForFunction(() =>
    document.getElementById('stepError').textContent.includes('503'),
  );
  assert.ok(await page.isEnabled('#nextButton'));
  await onStep(page, 1);
  await page.unroute('**/assets/form.pdf');
  await page.click('#sendLink');
  await onStep(page, 4);
  assert.ok(await page.locator('#issuesList li:has-text("Signature")').count());
  await download(page, 'empty.pdf');
});

await test(
  'dark desktop form keeps signature controls and answers across navigation',
  async page => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await openRegistration(page, BASE);
    assert.equal(
      await page.locator('html').evaluate(element => getComputedStyle(element).colorScheme),
      'dark',
    );
    assert.equal(
      await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor),
      'rgb(21, 21, 21)',
    );
    assert.deepEqual(
      await page.locator('h1 > [aria-hidden=true]').evaluateAll(elements =>
        elements.map(element => ({
          blend: getComputedStyle(element).mixBlendMode,
          color: getComputedStyle(element).color,
        })),
      ),
      [
        { blend: 'screen', color: 'rgb(255, 0, 0)' },
        { blend: 'screen', color: 'rgb(0, 255, 0)' },
        { blend: 'screen', color: 'rgb(0, 0, 255)' },
      ],
    );
    await page.locator('header').evaluate(element =>
      element.getAnimations({ subtree: true }).forEach(animation => {
        animation.pause();
        animation.currentTime = 400;
      }),
    );
    await page.screenshot({ path: `${OUT}swiss-dark-desktop.png` });
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await onStep(page, 1);
    await page.fill('#fullName', 'Jane Citizen');
    await page.getByRole('link', { name: 'Sign', exact: true }).click();
    await onStep(page, 2);
    await page.click('#tabType');
    assert.equal(await page.inputValue('#sigTyped'), 'Jane Citizen');
    await page.click('[data-font="apple"]');
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await onStep(page, 1);
    assert.equal(await page.inputValue('#fullName'), 'Jane Citizen');
    await page.getByRole('link', { name: 'Sign', exact: true }).click();
    await onStep(page, 2);
    assert.equal(await page.getAttribute('[data-font="apple"]', 'aria-pressed'), 'true');
    await page.locator('#tabType').press('ArrowLeft');
    assert.equal(await page.getAttribute('#tabDraw', 'aria-selected'), 'true');
    assert.equal(await page.evaluate(() => document.activeElement.id), 'tabDraw');
    await page.locator('#tabDraw').press('ArrowRight');
    assert.equal(await page.inputValue('#sigTyped'), 'Jane Citizen');
    await page.screenshot({ path: `${OUT}desktop-dark-signature.png`, fullPage: true });
  },
  { width: 1200 },
);

async function signatureFile(page, mimeType = 'image/png') {
  const data = await page.evaluate(type => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 180;
    const context = canvas.getContext('2d');
    if (type === 'image/jpeg') {
      context.fillStyle = '#fff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.strokeStyle = '#10183a';
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(20, 100);
    context.bezierCurveTo(150, 0, 250, 180, 580, 70);
    context.stroke();
    return canvas.toDataURL(type).split(',')[1];
  }, mimeType);
  return {
    name: `signature.${mimeType.split('/')[1]}`,
    mimeType,
    buffer: Buffer.from(data, 'base64'),
  };
}

for (const mimeType of ['image/png', 'image/jpeg', 'image/webp']) {
  await test(`upload ${mimeType} signature into the PDF`, async page => {
    await openRegistration(page, BASE);
    await page.getByRole('link', { name: 'Sign', exact: true }).click();
    await onStep(page, 2);
    await page.click('#tabUpload');
    const file = await signatureFile(page, mimeType);
    await page.setInputFiles('#signatureFile', file);
    await page.getByRole('button', { name: 'Keep original', exact: true }).click();
    const uploaded = page.getByAltText('Uploaded signature');
    await uploaded.waitFor();
    const source = await uploaded.getAttribute('src');
    assert.match(source, /^data:image\/png;base64,/);
    await page.setInputFiles('#signatureFile', {
      name: 'broken.png',
      mimeType: 'image/png',
      buffer: Buffer.from('not an image'),
    });
    await page.waitForFunction(() =>
      document.getElementById('signatureUploadError').textContent.includes('could not be read'),
    );
    assert.equal(
      await uploaded.getAttribute('src'),
      source,
      'failed replacement retains previous image',
    );
    await page.getByRole('button', { name: 'Clear image' }).click();
    assert.equal(await uploaded.count(), 0);
    await page.setInputFiles('#signatureFile', file);
    await page.getByRole('button', { name: 'Keep original', exact: true }).click();
    await uploaded.waitFor();
    await page.locator('#tabUpload').press('ArrowRight');
    assert.equal(await page.getAttribute('#tabDraw', 'aria-selected'), 'true');
    await page.click('#tabUpload');
    await next(page);
    await onStep(page, 3);
    await assertPreviewPlacement(page);
    const signature = page.locator('[data-id="signature"] img');
    assert.equal(await signature.getAttribute('src'), source, 'preview uses uploaded image');
    const bounds = await signature.boundingBox();
    assert.ok(Math.abs(bounds.width / bounds.height - 600 / 180) < 0.05, 'aspect ratio preserved');
    await page.screenshot({ path: `${OUT}uploaded-${mimeType.split('/')[1]}.png`, fullPage: true });
    await next(page);
    await onStep(page, 4);
    assert.equal(await page.locator('#issuesList li:has-text("Signature")').count(), 0);
    const name = `uploaded-${mimeType.split('/')[1]}.pdf`;
    await download(page, name);
    const pdf = await PDFDocument.load(await readFile(`${OUT}${name}`));
    const objects = pdf.getPage(1).node.Resources().lookup(PDFName.of('XObject'), PDFDict);
    assert.ok(
      objects.values().some(ref => {
        const object = pdf.context.lookup(ref);
        return (
          object.dict?.get(PDFName.of('Subtype')) === PDFName.of('Image') &&
          object.dict.get(PDFName.of('Width'))?.asNumber() === 600
        );
      }),
      'uploaded image is embedded on the signature page',
    );
    await page.reload();
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await page.getByRole('link', { name: 'Sign', exact: true }).click();
    await page.click('#tabUpload');
    assert.equal(await uploaded.count(), 0, 'uploaded signature is cleared on production reload');
  });
}

await test('Registration is the entry point and About preserves answers on desktop and mobile', async page => {
  for (const width of [1280, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(BASE);
    await onStep(page, 1);
    assert.equal(
      await page.locator('#progress a[aria-current]').getAttribute('aria-label'),
      'Your Deets',
    );
    assert.ok(
      await page.evaluate(() => document.body.getBoundingClientRect().height >= innerHeight),
    );
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await onStep(page, 1);
    assert.equal(
      await page.locator('#progress a[aria-current]').getAttribute('aria-label'),
      'Your Deets',
    );
    await page.fill('#fullName', 'Keep My Answers');
    const about = page.getByRole('link', { name: 'What’s this about', exact: true });
    assert.ok(await about.getByText('00', { exact: true }).isVisible());
    await about.click();
    await onStep(page, 0);
    assert.equal(await about.getAttribute('aria-current'), 'page');
    assert.ok(await page.locator('#wizard').isHidden());
    assert.ok(await page.getByRole('heading', { name: 'The Plans', exact: true }).isVisible());
    const state = page.getByRole('link', { name: 'State Plan', exact: true });
    const council = page.getByRole('link', { name: 'Woollahra Plan', exact: true });
    assert.equal(
      await state.getAttribute('href'),
      'https://www.planningportal.nsw.gov.au/ppr/under-exhibition/edgecliff-woollahra-precinct',
    );
    assert.equal(
      await council.getAttribute('href'),
      'https://www.woollahra.nsw.gov.au/Building-and-development/State-Led-Rezoning-Around-Edgecliff-and-proposed-Woollahra-Stations',
    );
    const left = await state.boundingBox();
    const right = await council.boundingBox();
    assert.ok(left.x < right.x && Math.abs(left.y - right.y) < 1, 'plan links stay side by side');
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: `${OUT}about-${width}.png` });
    await page.goBack();
    await onStep(page, 1);
    assert.equal(await page.inputValue('#fullName'), 'Keep My Answers');
    await page.goForward();
    await onStep(page, 0);
    await page.getByRole('button', { name: 'I want to sign up to speak', exact: true }).click();
    await onStep(page, 1);
    assert.equal(await page.inputValue('#fullName'), 'Keep My Answers');
  }
});

await test('prefilled agenda, visible attendance choices, and reversible alternative path', async page => {
  await openRegistration(page, `${BASE}?item=Rezoning&date=2026-10-14`);
  const assisted = await page.locator('input[name=stance]:checked').inputValue();
  const alternative = assisted === 'support' ? 'objection' : 'support';
  assert.equal(await page.locator('#progress a:visible').count(), 5);
  assert.equal(await page.getAttribute('#agendaToggle', 'aria-expanded'), 'false');
  assert.equal(await page.locator('input[name=mode]:checked').count(), 0);
  assert.ok(await page.locator('#attendanceOptions').isVisible());
  assert.ok(await page.getByRole('radio', { name: 'In person', exact: true }).isVisible());
  assert.ok(await page.getByRole('radio', { name: 'Via Zoom', exact: true }).isVisible());
  await page.check('input[name=mode][value=person]', { force: true });
  assert.ok(await page.isChecked('input[name=mode][value=person]'));
  await page.fill('#fullName', 'Keep My Answers');
  await page.check('input[name=rep][value=yes]', { force: true });
  await page.fill('#repDetails', 'Our neighbourhood');
  await page.check(`input[name=stance][value=${alternative}]`, { force: true });
  await page.locator('#alternativeNotice').waitFor();
  assert.equal(await page.locator('#fullName').count(), 0);
  assert.equal(await page.locator('#repDetails').count(), 0);
  assert.equal(await page.locator('#nextButton').count(), 0);
  assert.equal(await page.locator('#progress a:visible').count(), 2);
  await page.check(`input[name=stance][value=${assisted}]`, { force: true });
  assert.equal(await page.inputValue('#fullName'), 'Keep My Answers');
  assert.equal(await page.inputValue('#repDetails'), 'Our neighbourhood');
  assert.equal(await page.locator('#progress a:visible').count(), 5);
  await next(page);
  await onStep(page, 2);
  for (const mode of ['person', 'zoom']) {
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await page.check(`input[name=mode][value=${mode}]`);
    await page.getByRole('link', { name: 'Check on form', exact: true }).click();
    await onStep(page, 3);
    assert.equal(
      await page.locator(`[data-id="${mode}"]`).count(),
      1,
      'PDF marks the chosen attendance option',
    );
    assert.equal(
      await page.locator(`[data-id="${mode === 'person' ? 'zoom' : 'person'}"]`).count(),
      0,
    );
    await page.getByRole('link', { name: 'Download', exact: true }).click();
    await onStep(page, 4);
    assert.ok(
      await page
        .getByText(
          mode === 'person'
            ? /Remember you're speaking in person at Council Chambers/
            : /Remember you're speaking via Zoom/,
        )
        .isVisible(),
    );
  }
});

await test(
  'alternate position freezes the current header and anchors the footer',
  async page => {
    for (const colorScheme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme });
      for (const scrollTop of [0, 80]) {
        await openRegistration(page, `${BASE}?item=Rezoning&date=2026-10-14`);
        await page.waitForSelector('#fullName');
        const assisted = await page.locator('input[name=stance]:checked').inputValue();
        await page.locator('#formContent').evaluate((element, top) => {
          element.scrollTop = top;
        }, scrollTop);
        await page.waitForFunction(
          compact => document.querySelector('[data-compact]')?.dataset.compact === String(compact),
          true,
        );
        // Selecting the alternate position preserves the collapsed header.
        const before = await page.evaluate(() => {
          const height = document.querySelector('header').getBoundingClientRect().height;
          document.querySelector('input[name=stance]:not(:checked)').click();
          return height;
        });
        await page.locator('[data-layout-frozen=true]').waitFor();
        const snapshot = () =>
          page.locator('[data-header-motion]').evaluateAll(elements =>
            elements.map(element => ({
              height: element.getBoundingClientRect().height,
              font: getComputedStyle(element).fontSize,
              transform: getComputedStyle(element).transform,
            })),
          );
        const frozen = await snapshot();
        assert.ok(Math.abs(frozen[0].height - before) < 1, 'header retains its size at selection');
        await page.locator('h1').hover();
        await page.locator('#formContent').evaluate(element => {
          element.scrollTop = element.scrollHeight;
        });
        await page.waitForTimeout(350);
        assert.deepEqual(
          await snapshot(),
          frozen,
          'scroll and hover do not animate the frozen header',
        );
        const footer = await page.locator('footer').boundingBox();
        assert.ok(
          Math.abs(footer.y + footer.height - (page.viewportSize().height - 24)) < 1,
          'footer stays at the bottom',
        );
        await page.evaluate(
          value => document.querySelector(`input[name=stance][value=${value}]`).click(),
          assisted,
        );
        await page.locator('[data-layout-frozen=false]').waitFor();
        await page.locator('#formContent').evaluate(element => {
          element.scrollTop = 0;
        });
        await page.waitForFunction(
          () => document.querySelector('[data-compact]')?.dataset.compact === 'true',
        );
        await page.locator('#formContent').evaluate(element => {
          element.scrollTop = 80;
        });
        await page.waitForFunction(
          () => document.querySelector('[data-compact]')?.dataset.compact === 'true',
        );
        assert.equal(
          await page.locator('header').evaluate(element => element.style.length),
          0,
          'header sizing is responsive again',
        );
      }
    }
  },
  { width: 1280 },
);

await test('disclaimer is static at the end of the step 01 introduction', async page => {
  for (const width of [1280, 400]) {
    await page.setViewportSize({ width, height: 900 });
    await openRegistration(page, BASE);
    const disclaimer = page
      .locator('section[data-step="1"] p')
      .filter({ hasText: 'Disclaimer: I am not Woollahra Council' });
    assert.equal(await disclaimer.count(), 1);
    assert.ok(await disclaimer.isVisible());
    assert.equal(
      await disclaimer.evaluate(element => element.getAnimations({ subtree: true }).length),
      0,
    );
    assert.equal(await disclaimer.evaluate(element => element.nextElementSibling), null);
    assert.ok(!(await page.locator('footer').innerText()).includes('just some dude'));
  }
});

await test(
  'Swiss desktop layout fits the viewport and shrinks its heading on scroll',
  async page => {
    await page.goto(`${BASE}?item=Rezoning&date=2026-10-14`);
    await onStep(page, 1);
    await page.getByRole('link', { name: 'What’s this about', exact: true }).click();
    await onStep(page, 0);
    // Exercise the scroll behaviour with room for the author's forthcoming About copy.
    await page.locator('section[data-step="0"]').evaluate(element => {
      element.style.minHeight = '1200px';
    });
    assert.equal(await page.getByRole('heading', { level: 1 }).count(), 1);
    const layers = await page
      .locator('h1 > [aria-hidden=true]')
      .evaluateAll(elements => elements.map(element => getComputedStyle(element).mixBlendMode));
    assert.deepEqual(layers, ['multiply', 'multiply', 'multiply']);
    const footer = page.locator('footer');
    const assertFooterVisible = async () => {
      const rect = await footer.boundingBox();
      assert.ok(
        rect.y >= 0 && rect.y + rect.height <= page.viewportSize().height + 1,
        'whole footer visible',
      );
    };
    const assertViewport = async () => {
      assert.equal(await footer.locator('br').count(), 0, 'no forced footer line breaks');
      const dimensions = await page.evaluate(() => ({
        height: document.documentElement.scrollHeight,
        width: document.documentElement.scrollWidth,
        viewportHeight: innerHeight,
        viewportWidth: innerWidth,
      }));
      assert.ok(dimensions.height <= dimensions.viewportHeight + 1, 'document fits 100dvh');
      assert.ok(dimensions.width <= dimensions.viewportWidth, 'no horizontal overflow');
    };
    await assertViewport();
    await assertFooterVisible();
    assert.ok(!(await footer.innerText()).includes('No analytics, no trackers, no nothing.'));
    const labels = await page.locator('#progress a span:last-child').evaluateAll(elements =>
      elements.map(element => ({
        height: element.getBoundingClientRect().height,
        lineHeight: parseFloat(getComputedStyle(element).lineHeight),
      })),
    );
    assert.ok(
      labels.every(label => label.height <= label.lineHeight + 1),
      'sidebar labels each occupy one line',
    );
    await page.locator('header').evaluate(element =>
      element.getAnimations({ subtree: true }).forEach(animation => {
        animation.pause();
        animation.currentTime = 400;
      }),
    );
    await page.screenshot({ path: `${OUT}swiss-desktop.png` });
    const expanded = (await page.locator('header').boundingBox()).height;
    await page.locator('#formContent').evaluate(element => {
      element.scrollTop = 250;
    });
    await page.waitForFunction(
      height => document.querySelector('header').getBoundingClientRect().height < height - 30,
      expanded,
    );
    await assertViewport();
    assert.equal(await footer.evaluate(element => getComputedStyle(element).position), 'static');
    assert.ok(
      (await footer.boundingBox()).y >= page.viewportSize().height,
      'footer leaves the viewport while scrolling About',
    );
    await page.screenshot({ path: `${OUT}swiss-desktop-scrolled.png` });
    await page.locator('#formContent').evaluate(element => {
      element.scrollTop = element.scrollHeight;
    });
    await assertFooterVisible();
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await page.locator('section[data-step="1"]').evaluate(element => {
      element.style.minHeight = '1200px';
    });
    for (const top of [250, 0]) {
      await page.locator('#formContent').evaluate((element, scrollTop) => {
        element.scrollTop = scrollTop;
      }, top);
      await page.waitForFunction(
        compact => document.querySelector('[data-compact]')?.dataset.compact === String(compact),
        top > 12,
      );
      await page.waitForFunction(compact => {
        const size = parseFloat(getComputedStyle(document.querySelector('h1')).fontSize);
        return compact ? size === 48 : size > 60;
      }, top > 12);
    }
    for (const label of ['Sign', 'Check on form', 'Download']) {
      await page.getByRole('link', { name: label, exact: true }).click();
      await page.waitForFunction(() => !document.querySelector('#nextButton[aria-busy=true]'));
      await page.waitForFunction(
        () => getComputedStyle(document.querySelector('h1')).fontSize === '48px',
      );
      const collapsedHeight = (await page.locator('header').boundingBox()).height;
      assert.equal(
        await footer.evaluate(element => getComputedStyle(element).position),
        'static',
        `${label}: footer never sticks`,
      );
      await page.locator('#formContent').evaluate(element => {
        element.scrollTop = element.scrollHeight;
      });
      await assertFooterVisible();
      await page.locator('#formContent').evaluate(element => {
        element.scrollTop = 0;
        element.dispatchEvent(new Event('scroll'));
      });
      assert.equal(
        await page.locator('[data-step][data-compact]').getAttribute('data-compact'),
        'true',
        `${label}: header stays collapsed at the top`,
      );
      assert.ok(
        Math.abs((await page.locator('header').boundingBox()).height - collapsedHeight) < 1,
        `${label}: scrolling does not resize the header`,
      );
    }
    await page.getByRole('link', { name: 'What’s this about', exact: true }).click();
    await page.waitForFunction(
      () => document.querySelector('[data-compact]')?.dataset.compact === 'false',
    );
    await page.waitForFunction(
      () => parseFloat(getComputedStyle(document.querySelector('h1')).fontSize) > 60,
    );
    await page.getByRole('link', { name: 'Sign', exact: true }).click();
    await page.waitForFunction(
      () => getComputedStyle(document.querySelector('h1')).fontSize === '48px',
    );
    assert.equal(
      await page.locator('[data-step][data-compact]').getAttribute('data-compact'),
      'true',
      'leaving About collapses the header',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await page.getByRole('link', { name: 'What’s this about', exact: true }).click();
    await onStep(page, 0);
    assert.ok(
      await page
        .locator('h1 > [aria-hidden=true] > span')
        .evaluateAll(elements =>
          elements.every(element => getComputedStyle(element).animationName === 'none'),
        ),
    );
    await page.setViewportSize({ width: 1024, height: 640 });
    await assertViewport();
    await assertFooterVisible();
    await page.setViewportSize({ width: 320, height: 800 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'small phone has no overflow',
    );
    await page.screenshot({ path: `${OUT}swiss-mobile.png`, fullPage: true });
  },
  { width: 1280 },
);

await test('address autofill fields include locality and postcode on the PDF preview', async page => {
  await page.goto(BASE);
  await onStep(page, 1);
  const fields = {
    address: ['street-address', 'Unit 2, 12 Smith Street'],
    suburb: ['address-level2', 'Darwin'],
    state: ['address-level1', 'NT'],
    postcode: ['postal-code', '0800'],
  };
  for (const [id, [token, value]] of Object.entries(fields)) {
    assert.equal(await page.getAttribute(`#${id}`, 'autocomplete'), `section-speaker ${token}`);
    await page.fill(`#${id}`, value);
  }
  assert.equal(await page.getAttribute('#postcode', 'inputmode'), 'numeric');
  await page.evaluate(() => {
    location.hash = '?page=check';
  });
  await onStep(page, 3);
  assert.match(
    await page.locator('[data-id="address"]').innerText(),
    /Unit 2, 12 Smith Street, Darwin NT 0800/,
  );
  await page.evaluate(() => {
    location.hash = '?page=details';
  });
  await onStep(page, 1);
  assert.equal(await page.inputValue('#postcode'), '0800');
  assert.equal(await page.inputValue('#suburb'), 'Darwin');
});

await test('download errors appear after landing on any form step and remain enabled through About', async page => {
  await page.route('https://www.youtube-nocookie.com/embed/CdbR1jXyu4c', route =>
    route.fulfill({ status: 200, contentType: 'text/html', body: '' }),
  );
  for (const [route, step, showErrors] of [
    ['about', 0, false],
    ['send', 4, false],
    ['details', 1, true],
    ['signature', 2, true],
    ['check', 3, true],
  ]) {
    await page.goto(`${BASE}#?page=${route}`);
    await onStep(page, step);
    await page.locator('#progress a[href="#?page=about"]').click();
    await onStep(page, 0);
    await page.locator('#progress a[href="#?page=send"]').click();
    await onStep(page, 4);
    assert.equal(await page.locator('#issues').isVisible(), showErrors, `landing on ${route}`);
    if (showErrors) {
      assert.ok(await page.locator('#issuesList li:has-text("Full name")').count());
      assert.ok(await page.locator('#issuesList li:has-text("Signature")').count());
    }
  }
}, { allowedExternalRequests: ['https://www.youtube-nocookie.com/embed/CdbR1jXyu4c'] });

await test('human readable hash routes support deep links and back forward without losing answers', async page => {
  await page.goto(`${BASE}?mode=zoom#?page=signature`);
  await onStep(page, 2);
  assert.equal(await page.getAttribute('#tabUpload', 'aria-selected'), 'true');
  assert.deepEqual(await page.locator('[role="tablist"] [role="tab"]').allTextContents(), [
    'Upload image',
    'Draw it',
    'Type it',
  ]);
  await page.evaluate(() => {
    location.hash = '?page=details';
  });
  await onStep(page, 1);
  await page.fill('#fullName', 'Route Test');
  await next(page);
  await onStep(page, 2);
  assert.ok(page.url().endsWith('#?page=signature'));
  await page.goBack();
  await onStep(page, 1);
  assert.equal(await page.inputValue('#fullName'), 'Route Test');
  await page.goForward();
  await onStep(page, 2);
  await page.evaluate(() => {
    location.hash = '?page=send';
  });
  await onStep(page, 4);
  await page.locator('#downloadLink').waitFor();
  const items = page.locator('section[data-step="4"] ol > li');
  assert.equal(await items.count(), 5);
  assert.equal(await items.nth(3).locator(':scope > div > ul > li').count(), 2);
  assert.match(await items.nth(4).innerText(), /Zoom link/);
  await page.evaluate(() => {
    location.hash = '?page=unknown';
  });
  await onStep(page, 1);
  assert.ok(page.url().endsWith('#?page=details'));
});

await test('offline cache covers unvisited steps, signature fonts, PDF download and reload under a subdirectory', async page => {
  await page.goto(BASE);
  await onStep(page, 1);
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });
  const scope = await page.evaluate(
    async () => (await navigator.serviceWorker.getRegistration()).scope,
  );
  assert.equal(scope, BASE);
  await page.fill('#fullName', 'Offline Citizen');
  // WebKit's setOffline can reject even service-worker responses:
  // https://github.com/microsoft/playwright/issues/42775
  // An unreachable origin verifies the cache independently of that emulation bug.
  if (process.env.TEST_BROWSER === 'webkit') originUnavailable = true;
  else await page.context().setOffline(true);
  assert.equal(
    await page.evaluate(async () => {
      try {
        await fetch('__offline_probe__', { cache: 'no-store' });
        return true;
      } catch {
        return false;
      }
    }),
    false,
    'the origin is unreachable',
  );
  await next(page);
  await onStep(page, 2);
  await page.click('#tabType');
  await page.fill('#sigTyped', 'Offline Citizen');
  await next(page);
  await onStep(page, 3);
  await page.evaluate(async () => {
    const sheets = [...document.querySelectorAll('[data-sheet]')];
    if (sheets.length !== 2) throw new Error('Missing form pages');
    await Promise.all(
      sheets.map(async sheet => {
        const image = new Image();
        image.src = getComputedStyle(sheet).backgroundImage.slice(5, -2);
        await image.decode();
        if (!image.naturalWidth) throw new Error('Form preview image did not load offline');
      }),
    );
  });
  await assertPreviewPlacement(page);
  await next(page);
  await onStep(page, 4);
  await download(page, 'offline.pdf');
  const pdf = await PDFDocument.load(await readFile(`${OUT}offline.pdf`));
  assert.equal(pdf.getPageCount(), 2);
  const fontsLoaded = await page.evaluate(async () => {
    const fonts = [
      '500 10px "Caveat"',
      '400 10px "Homemade Apple"',
      '400 10px "Mrs Saint Delafield"',
      '400 10px "Arimo"',
    ];
    const faces = await Promise.all(fonts.map(font => document.fonts.load(font)));
    return faces.every(list => list.length > 0 && list.every(face => face.status === 'loaded'));
  });
  assert.ok(fontsLoaded, 'all signature and PDF preview fonts load offline');
  await page.reload();
  await onStep(page, 4);
  await page.evaluate(() => {
    location.hash = '?page=details';
  });
  await onStep(page, 1);
  assert.equal(await page.inputValue('#fullName'), '', 'cache does not persist answers');
});

await test('signature background wizard previews transparent paper and exports the chosen image', async page => {
  await page.goto(`${BASE}#?page=signature`);
  await onStep(page, 2);
  const file = await signatureFile(page, 'image/jpeg');
  await page.setInputFiles('#signatureFile', file);
  const apply = page.getByRole('button', { name: 'Use cleaned signature' });
  await page.waitForFunction(() =>
    [...document.querySelectorAll('button')].some(
      button => button.textContent === 'Use cleaned signature' && !button.disabled,
    ),
  );
  const preview = page.getByAltText('Signature with background removed');
  const pixels = await preview.evaluate(async image => {
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
    return {
      cornerAlpha: data[3],
      inkPixels: [...data].filter((value, index) => index % 4 === 3 && value > 200).length,
    };
  });
  assert.equal(pixels.cornerAlpha, 0);
  assert.ok(pixels.inkPixels > 100, 'ink retained');
  await page.screenshot({ path: `${OUT}signature-background-wizard.png`, fullPage: true });
  const cleaned = await preview.getAttribute('src');
  await apply.click();
  assert.equal(await page.getByAltText('Uploaded signature').getAttribute('src'), cleaned);
  await next(page);
  await onStep(page, 3);
  assert.equal(await page.locator('[data-id="signature"] img').getAttribute('src'), cleaned);
  await next(page);
  await onStep(page, 4);
  await download(page, 'cleaned-signature.pdf');
  const pdf = await PDFDocument.load(await readFile(`${OUT}cleaned-signature.pdf`));
  const objects = pdf.getPage(1).node.Resources().lookup(PDFName.of('XObject'), PDFDict);
  assert.ok(
    objects.values().some(ref => pdf.context.lookup(ref).dict?.has(PDFName.of('SMask'))),
    'PDF image has a transparency mask',
  );
  await page.evaluate(() => {
    location.hash = '?page=signature';
  });
  await onStep(page, 2);
  await page.getByRole('button', { name: 'Adjust background' }).click();
  await page.getByRole('button', { name: 'Keep original', exact: true }).click();
  assert.notEqual(await page.getByAltText('Uploaded signature').getAttribute('src'), cleaned);
});

// Check the shipped assets as well as runtime visibility: the dev module and guard are excluded.
const assets = new URL('../dist/assets/', import.meta.url);
for (const name of await readdir(assets)) {
  if (!/\.(js|css)$/.test(name)) continue;
  const source = await readFile(new URL(name, assets), 'utf8');
  assert.doesNotMatch(
    source,
    /Prefill demo|speak-woollahra:dev-preset|\[::1\]|Local development tools|devFont|devTheme/,
    `no dev feature in ${name}`,
  );
}

await new Promise(resolve => server.httpServer.close(resolve));
// preview() sets NODE_ENV=production; the second server must run with real dev transforms.
process.env.NODE_ENV = 'development';
const dev = await createServer({
  server: { host: '127.0.0.1', port: 0, strictPort: false, allowedHosts: ['woollahra.test'] },
});
await dev.listen();
const devPort = dev.httpServer.address().port;
BASE = `http://127.0.0.1:${devPort}/`;

await test(
  'configured objection position can complete the form and reverses the alternate path',
  async page => {
    await page.route('**/src/config.ts*', route =>
      route.fulfill({
        contentType: 'application/javascript',
        body: `export default { enableEmailInitialCopy: true, prefill: { reportTitle: 'Test Council motion', meetingDate: '2026-09-30', stance: 'objection', mode: 'zoom' } };`,
      }),
    );
    await openRegistration(page, BASE);
    assert.ok(await page.isChecked('input[name=stance][value=objection]'));
    await page.getByRole('button', { name: 'Prefill demo' }).click();
    assert.ok(
      await page.isChecked('input[name=stance][value=objection]'),
      'demo defaults follow the configured position',
    );
    await page.check('input[name=stance][value=support]', { force: true });
    await page.locator('#alternativeNotice').waitFor();
    assert.match(await page.locator('#alternativeNotice').innerText(), /In objection/);
    assert.equal(await page.locator('#nextButton').count(), 0);
    assert.equal(await page.locator('#sendLink').getAttribute('aria-disabled'), 'true');
    assert.equal(await page.locator('[data-layout-frozen=true]').count(), 1);
    await page.check('input[name=stance][value=objection]', { force: true });
    assert.equal(await page.inputValue('#fullName'), 'Jane Citizen');
    await next(page);
    await onStep(page, 2);
    await next(page);
    await onStep(page, 3);
    assert.equal(await page.locator('[data-id="objection"]').count(), 1);
    assert.equal(await page.locator('[data-id="support"]').count(), 0);
    await next(page);
    await onStep(page, 4);
    await page.getByText('Preview email', { exact: true }).click();
    const body = await page.locator('#emailBody').innerText();
    const emailUrl = new URL(await page.getAttribute('#emailLink', 'href'));
    assert.equal(body, emailUrl.searchParams.get('body'), 'preview matches the enabled email copy');
    assert.ok(body.length > 0 && body.length < 240);
    assert.ok(await page.getByRole('button', { name: 'Copy message' }).isVisible());
    await download(page, 'configured-objection.pdf');
    await openRegistration(page, `${BASE}?stance=support`);
    await page.locator('#alternativeNotice').waitFor();
    assert.equal(
      await page.locator('#nextButton').count(),
      0,
      'URL answers do not change the assisted position',
    );
  },
  { width: 1280 },
);

await test(
  'local appearance controls preview fonts and override either system theme',
  async page => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await openRegistration(page, BASE);
    await page.getByText('Appearance', { exact: true }).click();
    await page.getByLabel('Interface font').selectOption('inter');
    assert.ok(
      await page.evaluate(async () => (await document.fonts.load('700 20px Inter')).length > 0),
      'bundled Inter loads',
    );
    assert.match(
      await page.locator('h1').evaluate(element => getComputedStyle(element).fontFamily),
      /^Inter/,
    );
    const assertTheme = async dark => {
      assert.equal(
        await page.locator('body').evaluate(element => getComputedStyle(element).backgroundColor),
        dark ? 'rgb(21, 21, 21)' : 'rgb(247, 246, 242)',
      );
      assert.deepEqual(
        await page
          .locator('h1 > [aria-hidden=true]')
          .evaluateAll(elements => elements.map(element => getComputedStyle(element).mixBlendMode)),
        Array(3).fill(dark ? 'screen' : 'multiply'),
      );
      assert.equal(
        await page
          .locator('#nextButton')
          .evaluate(element => getComputedStyle(element).backgroundColor),
        dark ? 'rgb(255, 138, 36)' : 'rgb(255, 90, 0)',
      );
    };
    await page.getByLabel('Colour scheme').selectOption('dark');
    await assertTheme(true);
    await page.screenshot({ path: `${OUT}dev-appearance-dark-inter.png` });
    await page.getByLabel('Colour scheme').selectOption('system');
    await assertTheme(false);
    await page.emulateMedia({ colorScheme: 'dark' });
    await assertTheme(true);
    await page.getByLabel('Colour scheme').selectOption('light');
    await assertTheme(false);
    for (const [choice, family] of [
      ['arial', 'Arial'],
      ['publicSans', 'Public Sans'],
    ]) {
      await page.getByLabel('Interface font').selectOption(choice);
      assert.ok(
        (await page.locator('h1').evaluate(element => getComputedStyle(element).fontFamily))
          .replaceAll('"', '')
          .startsWith(family),
      );
    }
    await page.getByLabel('Interface font').selectOption('default');
    const family = await page
      .locator('h1')
      .evaluate(element => getComputedStyle(element).fontFamily);
    assert.ok(family.replaceAll('"', '') === 'Helvetica Neue, Helvetica, Inter, sans-serif');
    await page.getByText('Appearance', { exact: true }).click();
    await page.getByRole('link', { name: 'What’s this about', exact: true }).click();
    await page.locator('section[data-step="0"]').evaluate(element => {
      element.style.minHeight = '1200px';
    });
    for (const top of [80, 0]) {
      await page.locator('#formContent').evaluate((element, scrollTop) => {
        element.scrollTop = scrollTop;
      }, top);
      await page.waitForFunction(
        compact => document.querySelector('[data-compact]')?.dataset.compact === String(compact),
        top > 12,
      );
      assert.ok(
        await page.locator('header > p').evaluate(element => {
          const header = element.parentElement;
          return (
            Math.abs(element.offsetLeft + element.offsetWidth - header.clientWidth) <= 1 &&
            getComputedStyle(element).textAlign !== 'right'
          );
        }),
        'lede block aligns right while its text stays left aligned',
      );
    }
    await page.getByText('Appearance', { exact: true }).click();
    await page.getByLabel('Interface font').selectOption('inter');
    await page.setViewportSize({ width: 320, height: 800 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      'Inter and the menu fit on mobile',
    );
    await page.reload();
    await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
    await page.getByText('Appearance', { exact: true }).click();
    assert.equal(await page.getByLabel('Interface font').inputValue(), 'default');
    assert.equal(await page.getByLabel('Colour scheme').inputValue(), 'system');
  },
  { width: 1280 },
);

await test('local development remembers edits for the prefill button', async page => {
  await openRegistration(page, BASE);
  const prefill = page.getByRole('button', { name: 'Prefill demo' });
  await prefill.click();
  const position = await prefill.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return { top: rect.top, right: window.innerWidth - rect.right };
  });
  assert.ok(position.top < 20 && position.right < 20, 'button floats in top right');
  assert.equal(await page.inputValue('#fullName'), 'Jane Citizen');
  await page.fill('#fullName', 'Updated Demo Name');
  await page.fill('#phone', '0412 345 678');
  await page.getByRole('link', { name: 'Sign', exact: true }).click();
  await page.click('#tabUpload');
  await page.setInputFiles('#signatureFile', await signatureFile(page));
  await page.getByRole('button', { name: 'Keep original', exact: true }).click();
  await page.getByAltText('Uploaded signature').waitFor();
  await page.reload();
  await page.getByRole('link', { name: 'Your Deets', exact: true }).click();
  await prefill.waitFor();
  assert.equal(
    await page.inputValue('#fullName'),
    '',
    'saved defaults do not automatically populate the form',
  );
  await prefill.click();
  assert.equal(await page.inputValue('#fullName'), 'Updated Demo Name');
  assert.equal(await page.inputValue('#phone'), '0412 345 678');
  await page.getByRole('link', { name: 'Sign', exact: true }).click();
  assert.equal(await page.getAttribute('#tabUpload', 'aria-selected'), 'true');
  await page.getByAltText('Uploaded signature').waitFor();
  await next(page);
  await onStep(page, 3);
  await assertPreviewPlacement(page);
  await page.screenshot({ path: `${OUT}dev-prefill.png`, fullPage: true });
});

BASE = `http://woollahra.test:${devPort}/`;
await test('development tools are not loaded on another hostname', async page => {
  const devRequests = [];
  page.on('request', request => {
    if (request.url().includes('/src/ui/dev/')) devRequests.push(request.url());
  });
  await openRegistration(page, BASE);
  await page.waitForSelector('#nextButton');
  await onStep(page, 1);
  await page.fill('#fullName', 'Not Saved');
  assert.equal(await page.getByRole('button', { name: 'Prefill demo' }).count(), 0);
  assert.deepEqual(devRequests, [], 'dev code was never requested');
  assert.equal(await page.evaluate(() => localStorage.length), 0);
});

await dev.close();
await browser.close();
console.log(failures ? `\n${failures} failed` : `\nAll passed. Output in test-output/`);
process.exit(failures ? 1 : 0);
