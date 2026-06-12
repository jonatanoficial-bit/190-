import assert from 'node:assert/strict';
import { TRAINING_COURSES, TRAINING_REWARD_XP, getTrainingStepIds, validateTrainingCourse } from '../js/data/training.js';

const report = validateTrainingCourse(['pt-BR','en-US','es-419']);
assert.equal(report.ok, true, report.errors.join('\n'));
assert.equal(report.moduleCount, 5);
assert.equal(report.stepCount, 10);
assert.equal(TRAINING_REWARD_XP, 150);
assert.equal(new Set(getTrainingStepIds()).size, 10);

const baseIds = TRAINING_COURSES['pt-BR'].modules.flatMap((module) => module.steps.map((step) => step.id));
for (const locale of ['pt-BR','en-US','es-419']) {
  const pack = TRAINING_COURSES[locale];
  assert.ok(pack.ui.title && pack.ui.coachTitle && pack.ui.certificationTitle);
  assert.deepEqual(pack.modules.flatMap((module) => module.steps.map((step) => step.id)), baseIds);
  for (const module of pack.modules) {
    assert.equal(module.steps.length, 2);
    for (const step of module.steps) {
      assert.equal(step.options.length, 3);
      assert.equal(step.options.filter((option) => option.correct).length, 1);
      for (const option of step.options) assert.ok(option.text && option.feedback);
    }
  }
}
console.log('PASS training: 5 módulos, 10 decisões, 3 idiomas e respostas validadas.');
