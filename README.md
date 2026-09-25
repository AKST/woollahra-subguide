# Support the Woollahra Rezoning

[Open site](https://akst.io/unsorted/20260925/)

[Reduced motion](https://akst.io/unsorted/20260925/#?page=about&reducedMotion=true)

## Run

```sh
npm ci
npm run dev       # :5174
npm start         # :8000
```

## Publish

```sh
npm run build
npm run preview   # :4173
```

Upload all of `dist/`.

## Check

```sh
npm run typecheck
npm test
npm run format:check
```

## Edit

| Change                | File or directory                                                    |
| --------------------- | -------------------------------------------------------------------- |
| Defaults and dates    | [src/config.ts](src/config.ts)                                       |
| App setup             | [src/main.tsx](src/main.tsx)                                         |
| Theme                 | [src/styles.css](src/styles.css)                                     |
| Header and navigation | [src/ui/skeleton](src/ui/skeleton)                                   |
| Steps                 | [src/ui/steps](src/ui/steps)                                         |
| About copy            | [src/ui/steps/about/component.tsx](src/ui/steps/about/component.tsx) |
| Email copy            | [src/ui/steps/send/util.ts](src/ui/steps/send/util.ts)               |
| Shared controls       | [src/ui/common](src/ui/common)                                       |
| Dev tools             | [src/ui/dev](src/ui/dev)                                             |
| Shared utilities      | [src/common](src/common)                                             |
| API adapters          | [src/service](src/service)                                           |
| PDF and images        | [public/assets](public/assets)                                       |
