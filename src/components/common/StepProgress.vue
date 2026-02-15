<script setup>
defineProps({
  currentStep: {
    type: Number,
    required: true
  }
})

const steps = [
  { number: 1, label: '问题理解' },
  { number: 2, label: '深度分析' },
  { number: 3, label: '方案评估' }
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
            <span v-if="currentStep > step.number">✓</span>
            <span v-else>{{ step.number }}</span>
          </div>
          <span class="step-label">{{ step.label }}</span>
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
