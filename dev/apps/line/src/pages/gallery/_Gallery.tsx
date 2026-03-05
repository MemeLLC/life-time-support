import { useState, useEffect } from "react";
import { categories, images, type GalleryImage } from "./data";

// Image card component
function ImageCard({
  image,
  onOpen,
}: {
  image: GalleryImage;
  onOpen: (image: GalleryImage) => void;
}) {
  return (
    <button
      onClick={() => onOpen(image)}
      className="group bg-foreground/5 focus-visible:ring-primary/50 focus-visible:ring-offset-background relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:rounded-2xl"
    >
      <img
        src={image.src}
        alt={image.alt}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 group-active:scale-100"
      />
      {/* Overlay - always visible on mobile for better UX */}
      <div className="from-foreground/60 absolute inset-0 bg-linear-to-t via-transparent to-transparent sm:opacity-0 sm:transition-opacity sm:duration-500 sm:group-hover:opacity-100" />
      {/* Border effect */}
      <div className="border-primary/0 group-hover:border-primary/60 group-active:border-primary absolute inset-0 rounded-xl border-2 transition-all duration-300 sm:rounded-2xl" />
      {/* Caption - always visible on mobile */}
      <div className="absolute right-0 bottom-0 left-0 p-3 sm:translate-y-full sm:p-6 sm:transition-transform sm:duration-500 sm:ease-out sm:group-hover:translate-y-0">
        <p className="text-xs font-medium text-white sm:text-sm">{image.alt}</p>
      </div>
    </button>
  );
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalAnimating, setIsModalAnimating] = useState(false);
  const [activeCategory, setActiveCategory] = useState("エコカラット");

  // Get images for category
  const getCategoryImages = (categoryLabel: string) => {
    return images.filter((img) => img.category === categoryLabel);
  };

  // Handle modal open animation
  const openModal = (image: GalleryImage) => {
    setSelectedImage(image);
    setIsModalVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsModalAnimating(true);
      });
    });
  };

  // Handle modal close animation
  const closeModal = () => {
    setIsModalAnimating(false);
    setTimeout(() => {
      setIsModalVisible(false);
      setSelectedImage(null);
    }, 300);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isModalVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalVisible]);

  const categoryImages = getCategoryImages(activeCategory);

  return (
    <div className="bg-background min-h-screen px-4 py-8 sm:py-16">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="mb-8 text-center sm:mb-16">
          <div className="mb-6 inline-flex items-center gap-2">
            <span className="bg-primary h-[2px] w-12"></span>
            <span className="text-primary text-sm font-bold tracking-[0.3em]">GALLERY</span>
            <span className="bg-primary h-[2px] w-12"></span>
          </div>
          <h1 className="text-foreground mb-6 text-4xl font-black tracking-tight md:text-6xl">
            施工<span className="text-primary">事例</span>
          </h1>
          <p className="text-foreground/60 mx-auto max-w-2xl text-lg leading-relaxed">
            ライフタイムサポートでは数千種類ものオプション工事に対応しております。
            <br className="hidden sm:block" />
            こちらはその一部をご紹介しています。
          </p>
        </header>

        {/* Category Tabs */}
        <div className="bg-background/80 sticky top-0 z-40 -mx-4 backdrop-blur-sm sm:mx-0">
          <div className="scrollbar-hide flex gap-1 overflow-x-auto px-4 py-3 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:py-4">
            {categories.map((category) => (
              <button
                key={category.label}
                onClick={() => setActiveCategory(category.label)}
                className={`focus-visible:ring-primary/50 shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none sm:px-5 sm:py-2.5 ${
                  activeCategory === category.label
                    ? "border-primary bg-primary text-white"
                    : "border-foreground/10 text-foreground/50 hover:border-primary/30 hover:text-foreground/70"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Content */}
        <div className="mt-6 sm:mt-12">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {categoryImages.map((image) => (
              <ImageCard key={image.src} image={image} onOpen={openModal} />
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <footer className="mt-12 text-center sm:mt-20">
          <p className="text-foreground/50 text-sm sm:text-base">
            掲載以外の工事も承っております。お気軽にご相談ください。
          </p>
        </footer>
      </div>

      {/* Lightbox Modal with Animation */}
      {isModalVisible && selectedImage && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            isModalAnimating
              ? "bg-foreground/70 backdrop-blur-sm"
              : "bg-foreground/0 backdrop-blur-none"
          }`}
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-label="画像プレビュー"
        >
          {/* Modal content */}
          <div
            className={`relative max-h-[85vh] max-w-5xl transition-all duration-300 ease-out ${
              isModalAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - positioned on image */}
            <button
              onClick={closeModal}
              className={`bg-foreground/80 text-background hover:bg-foreground focus-visible:ring-primary/50 absolute top-2 right-2 z-10 rounded-full p-2 shadow-lg transition-all duration-300 focus-visible:ring-2 focus-visible:outline-none sm:top-3 sm:right-3 ${
                isModalAnimating ? "opacity-100" : "opacity-0"
              }`}
              aria-label="閉じる"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 sm:h-6 sm:w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="h-auto max-h-[80vh] w-auto rounded-xl object-contain shadow-2xl sm:rounded-2xl"
            />
            <div
              className={`mt-4 text-center transition-all delay-100 duration-300 ${
                isModalAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <p className="text-background/70 text-sm sm:text-base">{selectedImage.alt}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
