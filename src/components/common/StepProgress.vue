<!--
  @fileoverview Step progress indicator component
  @module components/common/StepProgress
  @description Displays a visual progress indicator for the three-step
  thinking workflow. Shows completed, active, and pending states
  with animated transitions.
  
  @copyright 2026 BigTooth
  @license GPL-3.0
-->

<script setup>
import { Check } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

defineProps({
  currentStep: {
    type: Number,
    required: true
  }
})

const { t } = useI18n()

const steps = [
  { number: 1, labelKey: 'think.step1' },
  { number: 2, labelKey: 'think.step2' },
  { number: 3, labelKey: 'think.step3' }
]
</script>

<template>
  <div class="step-progress">
    <div class="stepper">
      <template v-for="(step, index) in steps" :key="step.number">
        <div 
          class="step"
          :class="{
            active: currentStep === step.number,
            completed: currentStep > step.number
          }"
        >
          <div class="step-number">
            <Check v-if="currentStep > step.number" :size="20" stroke-width="3" />
            <span v-else>{{ step.number }}</span>
          </div>
          <span class="step-label">{{ t(step.labelKey) }}</span>
        </div>
        
        <div 
          v-if="index < steps.length - 1"
          class="step-connector"
          :class="{ completed: currentStep > step.number }"
        ></div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.step-progress {
  padding: var(--space-lg) 0;
  border-bottom: 1px solid var(--color-border);
  background: white;
}

.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.step {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.step-number {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: var(--radius-full);
  background: white;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  transition: all var(--transition-base);
}

.step.active .step-number {
  background: var(--color-text-primary);
  color: white;
  border-color: transparent;
  box-shadow: none;
}

.step.completed .step-number {
  background: white;
  color: var(--color-text-primary);
  border: 2px solid var(--color-text-primary);
}

.step-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  font-weight: 500;
}

.step.active .step-label,
.step.completed .step-label {
  color: var(--color-text-primary);
}

.step-connector {
  width: 60px;
  height: 1px;
  background: var(--color-border);
  transition: background var(--transition-base);
}

.step-connector.completed {
  background: var(--color-text-primary);
}

@media (max-width: 600px) {
  .step-label {
    display: none;
  }
  
  .step-connector {
    width: 40px;
  }
}
</style>
