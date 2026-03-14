<script setup>
import ContentCard from '../components/ContentCard.vue';
</script>
<template>
  <ContentCard>
    <h1>A Guide to Prayerful Reading</h1>
    <p class="lead">
      <em>Lectio Divina</em>, Latin for "divine reading," is a traditional
      monastic practice of praying with Scripture. It cultivates a deep,
      personal relationship with God by turning reading into a conversation.
    </p>

    <hr />

    <div class="lectio-step">
      <div class="step-header">
        <span class="step-number">1</span>
        <h2>Lectio (Reading)</h2>
      </div>
      <p>
        Select a short passage of Scripture—the daily reading from our homepage
        is a perfect place to start. Read it slowly and attentively, several
        times. Listen for a word or phrase that resonates with you, that catches
        your attention or touches your heart. Don't search for it; let it find
        you.
      </p>
    </div>

    <div class="lectio-step">
      <div class="step-header">
        <span class="step-number">2</span>
        <h2>Meditatio (Meditation)</h2>
      </div>
      <p>
        Take the word or phrase that stood out to you and gently repeat it to
        yourself. Reflect on it. Why did it stand out? What does it mean in the
        context of the passage? What does it mean for your life right now? This
        is not an intellectual exercise, but a gentle pondering with the heart.
      </p>
    </div>

    <div class="lectio-step">
      <div class="step-header">
        <span class="step-number">3</span>
        <h2>Oratio (Prayer)</h2>
      </div>
      <p>
        Now, turn your meditation into a conversation with God. Speak to Him
        from your heart about what you've reflected on. It could be a prayer of
        praise, of petition, of thanksgiving, or of sorrow. Be open and honest.
        This is the heart of the conversation, your response to God's word.
      </p>
    </div>

    <div class="lectio-step">
      <div class="step-header">
        <span class="step-number">4</span>
        <h2>Contemplatio (Contemplation)</h2>
      </div>
      <p>
        Finally, simply rest in God's presence. Let go of your own words and
        thoughts and be still. This is a moment of silent, loving communion,
        beyond words. It is a gift of grace, a moment to simply be with the One
        who loves you.
      </p>
    </div>
  </ContentCard>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;

.lead {
  text-align: center;
  max-width: 60ch;
  margin: 0 auto 2.5rem;
  font-size: 1.1rem;
  color: $light-gray;
  padding-left: 0;
}

hr {
  display: none;
}

.lectio-step {
  margin-bottom: 3rem;
  padding-top: 2.5rem;
  border-top: 1px solid #f0f0f0;
  opacity: 0;
  animation: fadeIn 0.6s ease-out forwards;

  &:first-of-type {
    border-top: none;
    padding-top: 0;
  }

  &:last-child {
    margin-bottom: 0;
  }

  // Stagger the animation for each step
  @for $i from 1 through 4 {
    &:nth-of-type(#{$i}) {
      animation-delay: #{$i * 0.1s};
    }
  }
}

.step-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    border: 2px solid $yellow;
    color: $yellow;
    font-weight: 700;
    font-size: 1.4rem;
  }

  h2 {
    margin: 0;
    font-family: 'New York', 'Georgia', serif;
    font-weight: 400;
    font-size: 1.75rem;
    color: $charcoal;
  }
}

p {
  line-height: 1.7;
  color: $light-gray;
  padding-left: 4rem; // Indent the paragraph to align with the text above
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
