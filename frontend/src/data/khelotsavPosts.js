// Dynamically load images from khelotsav-posts
const postModules = import.meta.glob('../assets/khelotsav-posts/*.{png,jpg,jpeg,webp}', {
  eager: true,
  import: 'default'
});

const allEntries = Object.entries(postModules);
const guidelineEntries = allEntries.filter(([path]) => path.toLowerCase().includes('guideline'));

export const khelotsavGalleryItems = allEntries
  .filter(([path]) => !path.toLowerCase().includes('guideline'))
  .map(([path, url]) => {
    const fileName = path.split('/').pop().replace(/\.[^/.]+$/, '');
    const text = fileName.replace(/_+$/, '').trim();

    // Find matching guideline
    const guidelineMatch = guidelineEntries.find(([gPath]) => {
      const gFileName = gPath.split('/').pop().replace(/\.[^/.]+$/, '').toUpperCase();
      return gFileName.startsWith(text.toUpperCase());
    });

    return {
      image: url,
      guideline: guidelineMatch ? guidelineMatch[1] : undefined,
      text: text
    };
  })
  .sort((a, b) => {
    // Sort sports events first alphabetically, then banner posters
    const isBannerA = a.text.toUpperCase().startsWith('BANNER');
    const isBannerB = b.text.toUpperCase().startsWith('BANNER');
    if (isBannerA !== isBannerB) {
      return isBannerA ? 1 : -1;
    }
    return a.text.localeCompare(b.text);
  });

export default khelotsavGalleryItems;
