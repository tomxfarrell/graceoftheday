<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(['close']);

const copyStatus = ref(''); // 'link', 'text', ''

const shareToX = () => {
  const tweetText = `"${props.text.substring(0, 220)}..."\n\n${props.title}`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}&url=${encodeURIComponent(props.url)}`;
  window.open(tweetUrl, '_blank', 'noopener,noreferrer');
};

const shareToFacebook = () => {
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(props.url)}`;
  window.open(facebookUrl, '_blank', 'noopener,noreferrer');
};

const copyToClipboard = async (content, type) => {
  try {
    await navigator.clipboard.writeText(content);
    copyStatus.value = type;
    setTimeout(() => {
      copyStatus.value = '';
      emit('close');
    }, 1500);
  } catch (err) {
    console.error('Failed to copy:', err);
    copyStatus.value = 'error';
  }
};
</script>

<template>
  <div class="share-overlay" @click.self="emit('close')">
    <div class="share-modal">
      <div class="share-header">
        <h3>Share Reflection</h3>
        <button class="close-button" @click="emit('close')">&times;</button>
      </div>
      <div class="share-options">
        <button @click="shareToX">
          <span>Share on X</span>
        </button>
        <button @click="shareToFacebook">
          <span>Share on Facebook</span>
        </button>
        <button @click="copyToClipboard(url, 'link')">
          <span v-if="copyStatus !== 'link'">Copy Link</span>
          <span v-else>Copied!</span>
        </button>
        <button @click="copyToClipboard(text, 'text')">
          <span v-if="copyStatus !== 'text'">Copy Full Text</span>
          <span v-else>Copied!</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.share-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
}

.share-modal {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
}

.share-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  h3 {
    margin: 0;
    font-size: 1.25rem;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    color: #999;
  }
}

.share-options {
  display: grid;
  gap: 0.75rem;

  button {
    width: 100%;
    padding: 0.75rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    background: #f9f9f9;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f0f0f0;
    }
  }
}
</style>
