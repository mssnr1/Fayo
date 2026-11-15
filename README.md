# Fayo

Gesichtsübungen für einen wachen, frischen Blick. Teil von Anima Labs (wie Fluo): die Figur, ihr Linien-Look und
die Muskelkarte des Gesichts kommen aus dem gemeinsamen Repo
[`mssnr1/anima-lab-design`](https://github.com/mssnr1/anima-lab-design), festgepinnt auf einen Commit in
`package.json`. Neue Stände von dort kommen erst an, wenn der Pin hier verschoben wird.

**Stand:** MVP mit einer geführten Übung, „Brauen-Lift“ (`src/exercises.ts`).

- Live: https://mssnr1.github.io/Fayo/
- Lokal: `npm install`, dann `npm run dev`
- Veröffentlichen: jeder Push auf `main` baut und veröffentlicht über GitHub Pages (`.github/workflows/deploy.yml`)

## Lizenz der Anatomie

Die 3D-Figur steht unter CC BY-SA 4.0 und muss genannt werden (steht auch in der App unten):

> Anatomy adapted from “Z-Anatomy – The libre 3D atlas of anatomy” (CC BY-SA 4.0) and “BodyParts3D, © The
> Database Center for Life Science” (CC BY-SA 2.1 Japan). Changes: selection, simplification, materials,
> shape keys.

Der App-Code ist davon nicht betroffen.
