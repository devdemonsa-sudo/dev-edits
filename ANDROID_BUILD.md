# Android build

O projeto Android do RepasseCheck foi gerado em `android/` com Capacitor e aponta para a web publicada.

## O que ja esta pronto

- Wrapper Android criado
- App aponta para `https://repassecheck.vercel.app`
- Manifest, PWA, login, dashboard, upload e modo local continuam funcionando

## Artefatos gerados neste computador

- `android/app/build/outputs/apk/debug/app-debug.apk`
- `android/app/build/outputs/apk/release/app-release-signed.apk`

O build de release foi assinado com a chave de debug local para deixar o APK instalavel neste ambiente.

## Fluxo de manutencao

```bash
npm install
npm run build
npm run cap:sync
cd android
./gradlew.bat assembleDebug
./gradlew.bat assembleRelease
```

Se quiser publicar na Play Store depois, o passo seguinte e trocar a assinatura de debug por uma keystore de producao.

## Onde mexer depois

- `capacitor.config.ts` para trocar a URL do app Android
- `android/app/src/main/AndroidManifest.xml` para permissoes extras
- `android/app/src/main/java/com/repassecheck/app/MainActivity.java` para customizacoes nativas
