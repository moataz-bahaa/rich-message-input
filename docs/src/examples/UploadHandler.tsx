import { TextInput, type UploadHandler } from 'rich-message-input';
import 'rich-message-input/styles.css';

// Replace the body with a call to your own storage (S3, Cloudinary, your API...).
// The package never uploads anything itself: it only needs the final URL back.
const upload: UploadHandler = async (file, meta) => {
  await new Promise((resolve) => setTimeout(resolve, 1200)); // pretend network
  return {
    kind: meta.kind,
    src: URL.createObjectURL(file), // in real code: the URL returned by your server
    name: meta.name,
    size: file.size,
    duration: meta.duration,
  };
};

export const UploadHandlerExample = () => (
  <TextInput
    onUpload={upload}
    maxFileSize={10 * 1024 * 1024}
    accept="image/*,audio/*,video/*,.pdf"
    onError={(error) => alert(error.message)}
  />
);
