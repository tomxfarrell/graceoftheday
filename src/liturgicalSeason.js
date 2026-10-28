import { ref } from 'vue';

export const liturgicalSeason = ref('Ordinary Time');
export const currentFeast = ref('');
// Today's verse, shared with the header's Share button
export const todaysVerse = ref({ text: '', reference: '' });
