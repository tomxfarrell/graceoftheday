<template>
  <div class="prayers-container">
    <div class="prayers-card">
      <h1>Common Prayers</h1>
      <p class="italics">A collection of foundational Catholic prayers to guide your conversation with God.</p>
      
      <hr />

      <div class="prayer-section">
        <h2>Our Father</h2>
        <p>Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come; Thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.</p>
      </div>

      <div class="prayer-section">
        <h2>Hail Mary</h2>
        <p>Hail Mary, full of grace. The Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death, Amen.</p>
      </div>

      <div class="prayer-section">
        <h2>Glory Be</h2>
        <p>Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.</p>
      </div>
      
      <div class="prayer-section">
        <h2>The Nicene Creed</h2>
        <p>I believe in one God, the Father almighty, maker of heaven and earth, of all things visible and invisible.</p>
        <p>I believe in one Lord Jesus Christ, the Only Begotten Son of God, born of the Father before all ages. God from God, Light from Light, true God from true God, begotten, not made, consubstantial with the Father; through him all things were made. For us men and for our salvation he came down from heaven, and by the Holy Spirit was incarnate of the Virgin Mary, and became man.</p>
        <p>For our sake he was crucified under Pontius Pilate, he suffered death and was buried, and rose again on the third day in accordance with the Scriptures. He ascended into heaven and is seated at the right hand of the Father. He will come again in glory to judge the living and the dead and his kingdom will have no end.</p>
        <p>I believe in the Holy Spirit, the Lord, the giver of life, who proceeds from the Father and the Son, who with the Father and the Son is adored and glorified, who has spoken through the prophets.</p>
        <p>I believe in one, holy, catholic and apostolic Church. I confess one Baptism for the forgiveness of sins and I look forward to the resurrection of the dead and the life of the world to come. Amen.</p>      
        </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// Using similar styles to AboutView for consistency
.prayers-container {
  padding: 40px 20px;
  display: flex;
  justify-content: center;

  .prayers-card {
    max-width: 900px;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: saturate(180%) blur(20px);
    -webkit-backdrop-filter: saturate(180%) blur(20px);
    padding: 40px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.4);
    text-align: left;
    line-height: 1.7;
    font-size: 1.15rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    animation: slideUpFade 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

    h1 { color: #2c3e50; text-align: center; font-size: 2.5rem; margin-bottom: 0.5rem; }

    .italics { font-style: italic; color: #576574; text-align: center; margin-bottom: 30px; font-size: 1.2rem; }
    
    hr { border: 0; border-top: 1px solid rgba(0,0,0,0.1); margin: 30px 0; }

    .prayer-section {
      margin-bottom: 2.5rem;
      
      h2 { font-family: 'Georgia', serif; font-size: 1.6rem; color: #2c3e50; margin-bottom: 0.75rem; }

      p { font-family: 'Georgia', serif; font-size: 1.2rem; color: #1d1d1f; }
    }
  }
}

@keyframes slideUpFade {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>