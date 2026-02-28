<script setup>
import ContentCard from '../components/ContentCard.vue';
</script>

<template>
  <ContentCard>
    <h1>Common Prayers</h1>
    <p class="lead">
      <em
        >A collection of foundational Catholic prayers to guide your
        conversation with God.</em
      >
    </p>

    <hr />

    <div class="prayer">
      <h2>Our Father</h2>
      <p>
        Our Father, Who art in heaven, hallowed be Thy name; Thy kingdom come;
        Thy will be done on earth as it is in heaven. Give us this day our daily
        bread; and forgive us our trespasses as we forgive those who trespass
        against us; and lead us not into temptation, but deliver us from evil.
        Amen.
      </p>
    </div>

    <div class="prayer">
      <h2>Hail Mary</h2>
      <p>
        Hail Mary, full of grace. The Lord is with thee. Blessed art thou
        amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary,
        Mother of God, pray for us sinners, now and at the hour of our death,
        Amen.
      </p>
    </div>

    <div class="prayer">
      <h2>Glory Be</h2>
      <p>
        Glory be to the Father, and to the Son, and to the Holy Spirit, as it
        was in the beginning, is now, and ever shall be, world without end.
        Amen.
      </p>
    </div>

    <div class="prayer">
      <h2>The Nicene Creed</h2>
      <p>
        I believe in one God, the Father almighty, maker of heaven and earth, of
        all things visible and invisible.
      </p>
      <p>
        I believe in one Lord Jesus Christ, the Only Begotten Son of God, born
        of the Father before all ages. God from God, Light from Light, true God
        from true God, begotten, not made, consubstantial with the Father;
        through him all things were made. For us men and for our salvation he
        came down from heaven, and by the Holy Spirit was incarnate of the
        Virgin Mary, and became man.
      </p>
      <p>
        For our sake he was crucified under Pontius Pilate, he suffered death
        and was buried, and rose again on the third day in accordance with the
        Scriptures. He ascended into heaven and is seated at the right hand of
        the Father. He will come again in glory to judge the living and the dead
        and his kingdom will have no end.
      </p>
      <p>
        I believe in the Holy Spirit, the Lord, the giver of life, who proceeds
        from the Father and the Son, who with the Father and the Son is adored
        and glorified, who has spoken through the prophets.
      </p>
      <p>
        I believe in one, holy, catholic and apostolic Church. I confess one
        Baptism for the forgiveness of sins and I look forward to the
        resurrection of the dead and the life of the world to come. Amen.
      </p>
    </div>
  </ContentCard>
</template>

<style lang="scss" scoped>
.prayer {
  margin-bottom: 2.5rem;
  &:last-child {
    margin-bottom: 0;
  }
}
</style>
