# Fayo: notes for Claude

- Owner is Jan, he writes German: reply in German. Docs German, code and comments English.
- Fayo is the face-exercise app of Anima Labs. Figure, line look, face muscle map (`faceMuscleMaterial`,
  `muscleHead`, `faceMuscleRig`) and the exercise timeline (`facePose`) come from `mssnr1/anima-lab-design`,
  pinned by commit in `package.json`. Change shared pieces there, then move the pin here.
- Exercises live in `src/exercises.ts`; area ids are `FACE_AREAS` ids (paired muscles as `…Left`/`…Right`).
- Night look is the default and Jan's favourite; keep the day look quiet (only the working muscle shows colour).
- Keep the anatomy credit (CC BY-SA 4.0) visible in the app.
- Every push to `main` publishes to https://mssnr1.github.io/Fayo/ (`.github/workflows/deploy.yml`).
