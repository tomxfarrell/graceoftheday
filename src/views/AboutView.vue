<script setup>
import ContentCard from '../components/ContentCard.vue';
</script>

<template>
  <ContentCard>
    <h1>Our Mission</h1>
    <p class="lead">
      "Go into all the world and proclaim the Gospel to the whole creation." —
      Mark 16:15
    </p>

    <hr />

    <div class="content-grid">
      <section class="about">
        <h2>A Daily Moment of Grace</h2>
        <p>
          In the midst of our fast-paced lives, it can be challenging to find a
          quiet moment for God. <strong>Grace of the Day</strong> is a simple
          digital sanctuary designed to bring the rhythm of the Catholic
          Liturgical Year into your daily routine.
        </p>
        <p>
          Each day, we offer a small, digestible portion of spiritual
          nourishment—a key scripture, a virtue to practice, a reflection, and a
          prayer—to help you pause and reconnect.
        </p>
      </section>

      <section class="technology">
        <h2>Faith Meets Innovation</h2>
        <p>
          Grace of the Day harmonizes ancient tradition with modern technology.
          We utilize artificial intelligence to assist in curating daily
          scripture, reflections, and prayers that align with the Liturgical
          calendar—creating a unique digital tool for the modern Catholic.
        </p>
      </section>

      <section class="participate">
        <h2>How You Can Participate</h2>
        <ul>
          <li>
            <strong>Begin with Prayer:</strong> Start your day with us to center
            your heart on what truly matters.
          </li>
          <li>
            <strong>Share the Light:</strong> Use the share button to send a
            reflection to a friend who might need a word of hope.
          </li>
          <li>
            <strong>Live the Virtue:</strong> Take on the "Faith in Action"
            challenge as a concrete way to live your faith.
          </li>
        </ul>
      </section>
    </div>
    <div class="footer-blessing">
      <p>May this tool be a small stepping stone on your path to holiness.</p>
      <strong>Pax et Bonum</strong>
    </div>
  </ContentCard>
</template>

<style lang="scss" scoped>
@use '../scss/variables' as *;

$spirit-purple: #8e44ad;

.content-grid {
  display: grid;
  gap: 2.5rem;
  margin-top: 2rem;

  section {
    padding: 1.5rem;
    border-radius: 12px;
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.05);

    // Entrance Animation
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 0.5s ease-out forwards;

    &:nth-child(1) {
      animation-delay: 0.1s;
    }
    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.3s;
    }

    h2 {
      font-family: 'New York', 'Georgia', serif;
      font-size: 1.3rem;
      color: $spirit-purple;
      margin-bottom: 1rem;
    }

    p,
    li {
      line-height: 1.7;
    }
  }

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);

    section:first-child {
      grid-column: 1 / -1;
      text-align: center;

      h2 {
        // Emphasize the main section's title
        font-size: 1.6rem;
      }
    }
  }
}

.footer-blessing {
  margin-top: 4rem;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 2.5rem;

  p {
    font-style: italic;
    color: #666;
    margin-bottom: 1rem;
  }

  strong {
    display: block;
    font-family: 'New York', 'Georgia', serif;
    color: $spirit-purple;
    font-size: 1.4rem;
    letter-spacing: 1px;
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
