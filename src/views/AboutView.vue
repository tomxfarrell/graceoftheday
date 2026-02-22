<script setup>
// No logic required for a static mission page
</script>

<template>
  <div class="about-container">
    <div class="mission-card">
      <h1>Our Mission</h1>
      <p class="italics">"Go into all the world and proclaim the Gospel to the whole creation." — Mark 16:15</p>
      
      <hr />

      <div class="content-grid">
        <section>
          <h3>A Daily Moment of Grace</h3>
          <p>
            In the midst of our fast-paced lives, it can be challenging to find a quiet moment for God. <strong>Grace of the Day</strong> is a simple digital sanctuary designed to bring the rhythm of the Catholic Liturgical Year into your daily routine.
          </p>
          <p>
            Each day, we offer a small, digestible portion of spiritual nourishment—a key scripture, a virtue to practice, a reflection, and a prayer—to help you pause and reconnect.
          </p>
        </section>

        <section>
          <h3>How You Can Participate</h3>
          <ul>
            <li><strong>Begin with Prayer:</strong> Start your day with us to center your heart on what truly matters.</li>
            <li><strong>Share the Light:</strong> Use the share button to send a reflection to a friend who might need a word of hope.</li>
            <li><strong>Live the Virtue:</strong> Take on the "Faith in Action" challenge as a concrete way to live your faith.</li>
          </ul>
        </section>
      </div>

      <div class="footer-blessing">
        <p>May this tool be a small stepping stone on your path to holiness.</p>
        <strong>Pax et Bonum</strong>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$charcoal: #2c3e50;
$spirit-purple: #8e44ad;

.about-container {
  padding: 40px 20px;
  display: flex;
  justify-content: center;

  .mission-card {
    max-width: 900px;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    padding: 40px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    border-top: 6px solid $spirit-purple;
    text-align: left;
    line-height: 1.6;
    font-size: 1.15rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

    h1 { color: $charcoal; text-align: center; font-size: 2.5rem; margin-bottom: 0.5rem; }

    .italics { 
      font-style: italic; 
      color: lighten($charcoal, 20%); 
      text-align: center; 
      margin-bottom: 30px; 
      font-size: 1.2rem;
    }

    h3 { color: $spirit-purple; margin-top: 30px; font-weight: 700; }

    .content-grid {
      display: grid;
      gap: 40px;

      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }

      ul { 
        padding-left: 20px; 
        li { margin-bottom: 15px; }
      }
    }

    .footer-blessing {
      margin-top: 40px;
      text-align: center;
      border-top: 1px solid #eee;
      padding-top: 20px;
    }
  }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>