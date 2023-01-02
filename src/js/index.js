import { gsap } from "gsap";
import { Item } from "./item";
import { Preview } from "./preview";
import imagesLoaded from "imagesloaded";

const images = document.querySelectorAll("img");
let isLoaded = false;
let isLoadingAnimationEnd = false;
const imgLoad = imagesLoaded(images);
const preloader = document.querySelector(".preloader");
const preloaderTitle = document.querySelector(".preloader__title");
const preloaderSubtitle = document.querySelector(".preloader__subtitle");
const preloaderText = document.querySelector(".preloader__text");

// body element
const body = document.body;

// .content element
const contentEl = document.querySelector(".content");

// frame element
const frameEl = document.querySelector(".frame");

// top and bottom overlay overlay elements
const overlayRows = [...document.querySelectorAll(".overlay__row")];

// Preview instances array
const previews = [];
[...document.querySelectorAll(".preview")].forEach((preview) =>
  previews.push(new Preview(preview))
);

// Item instances array
const items = [];
[...document.querySelectorAll(".item")].forEach((item, pos) =>
  items.push(new Item(item, previews[pos]))
);

// preloader animation
const entranceAnimation = () => {
  const tl = gsap.timeline();
  tl.to(preloaderTitle, {
    y: -100,
    y: "0%",
    duration: 1,
    ease: "power2.inOut",
  })
    .to(
      preloaderText,
      {
        duration: 1,
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power2.out",
      },
      0.6
    )
    .to(
      preloaderSubtitle,
      {
        duration: 1,
        opacity: 1,
        y: 0,
        stagger: 0.1,
        ease: "power2.out",
      },
      0.6
    )
    .to(
      preloader,
      {
        yPercent: -100,
        duration: 1.25,
        ease: "power4.inOut",
      },
      0
    );
};

const loadingAnimation = () => {
  const tl = gsap
    .timeline({
      onComplete: () => {
        isLoadingAnimationEnd = true;
        if (isLoaded) entranceAnimation();
      },
    })
    .from(".loading", {
      yPercent: 100,
      ease: "power3.inOut",
      duration: 1,
    })
    .from(
      ".loading-image",
      {
        y: 80,
        duration: 1,
        ease: "power2.out",
      },
      0.5
    );
};

loadingAnimation();

imgLoad.on("always", function () {
  isLoaded = true;
  if (isLoadingAnimationEnd) entranceAnimation();
});

// items animation
const openItem = (item) => {
  gsap
    .timeline({
      defaults: {
        duration: 1,
        ease: "power3.inOut",
      },
    })
    .add(() => {
      // pointer events none to the content
      contentEl.classList.add("content--hidden");
    }, "start")
    .to(contentEl, {
      rotation: 90,
      opacity: 0,
      height: 0,
    })

    .addLabel("start", 0)
    .set(
      [item.preview.DOM.innerElements, item.preview.DOM.backCtrl],
      {
        opacity: 0,
      }
      // "start"
    )
    .to(
      overlayRows,
      {
        scaleY: 1,
      }
      // "start"
    )

    .addLabel("content", "start+=0.6")

    .add(() => {
      body.classList.add("preview-visible");

      gsap.set(
        frameEl,
        {
          opacity: 0,
        }
        // "start"
      );
      item.preview.DOM.el.classList.add("preview--current");
    }, "content")
    // Image animation (reveal animation)
    .to(
      [item.preview.DOM.image, item.preview.DOM.imageInner],
      {
        startAt: { y: (pos) => (pos ? "101%" : "-101%") },
        y: "0%",
      },
      "content"
    )

    .add(() => {
      for (const line of item.preview.multiLines) {
        line.in();
      }
      gsap.set(item.preview.DOM.multiLineWrap, {
        opacity: 1,
        delay: 0.1,
      });
    }, "content")
    // animate frame element
    .to(
      frameEl,
      {
        ease: "expo",
        startAt: { y: "-100%", opacity: 0 },
        opacity: 1,
        y: "0%",
      },
      "content+=0.3"
    )
    .to(
      item.preview.DOM.innerElements,
      {
        ease: "expo",
        startAt: { yPercent: 101 },
        yPercent: 0,
        opacity: 1,
      },
      "content+=0.3"
    )
    .to(
      item.preview.DOM.backCtrl,
      {
        opacity: 1,
      },
      "content"
    );
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 1000);
};

const closeItem = (item) => {
  gsap
    .timeline({
      defaults: {
        duration: 1,
        ease: "power3.inOut",
      },
    })

    .addLabel("start", 0)
    .to(
      item.preview.DOM.innerElements,
      {
        yPercent: -101,
        opacity: 0,
      },
      "start"
    )
    .add(() => {
      for (const line of item.preview.multiLines) {
        line.out();
      }
    }, "start")

    .to(
      item.preview.DOM.backCtrl,
      {
        opacity: 0,
      },
      "start"
    )

    .to(
      item.preview.DOM.image,
      {
        y: "101%",
      },
      "start"
    )
    .to(
      item.preview.DOM.imageInner,
      {
        y: "-101%",
      },
      "start"
    )

    // animate frame element
    .to(
      frameEl,
      {
        opacity: 0,
        y: "-100%",
        onComplete: () => {
          body.classList.remove("preview-visible");
          gsap.set(frameEl, {
            opacity: 1,
            y: "0%",
          });
        },
      },
      "start"
    )

    .addLabel("grid", "start+=0.6")

    .to(
      overlayRows,
      {
        //ease: 'expo',
        scaleY: 0,
        onComplete: () => {
          item.preview.DOM.el.classList.remove("preview--current");
          contentEl.classList.remove("content--hidden");
        },
      },
      "grid"
    )

    .to(
      contentEl,
      {
        rotation: 0,
        opacity: 1,
        height: "auto",
      },
      1
    );
};

for (const item of items) {
  // Opens the item preview
  item.DOM.link.addEventListener("click", () => {
    openItem(item);
  });

  // Closes the item preview
  item.preview.DOM.backCtrl.addEventListener("click", () => closeItem(item));
}
