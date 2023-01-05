import { gsap } from "gsap";
import { Item } from "./item";
import { Preview } from "./preview";
import imagesLoaded from "imagesloaded";

const images = document.querySelectorAll("img");
let isLoaded = false;
let isLoadingAnimationEnd = false;
const imgLoad = imagesLoaded(images);

// preloader and svg morph targets
const preloader = document.querySelector(".preloader");
const preloaderTitle = document.querySelector(".preloader__title");
const preloaderSubtitle = document.querySelector(".preloader__subtitle");
const preloaderText = document.querySelector(".preloader__text");
const svgMask = document.querySelector(".mask");
const svgPath = document.querySelector(".path");
const signature = document.querySelector(".signature");

// body element
const body = document.body;

// main element
const mainEl = document.querySelector("#main");

// .content element
const contentEl = document.querySelector(".content");

// items element
const itemEl = document.querySelector(".item");

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
const maskAnimation = () => {
  const tl = gsap.timeline();
  const start = "M 0 100 V 50 Q 50 0 100 50 V 100 z";
  const end = "M 0 100 V 0 Q 50 0 100 0 V 100 z";

  gsap.set(svgMask, { autoAlpha: 1 });
  tl.to(svgPath, {
    duration: 0.8,
    attr: { d: start },
    ease: "power2.in",
  }).to(svgPath, { duration: 0.4, attr: { d: end }, ease: "power2.out" });

  return tl;
};

const loadingAnimationOut = () => {
  const tl = gsap.timeline();
  tl.to(preloader, {
    y: -window.innerHeight,
    duration: 1.3,
    ease: "power2.inOut",
  }).to(contentEl, {
    opacity: 1,
    duration: 1,
    ease: "power2.inOut",
  });

  return tl;
};

const entranceAnimation = () => {
  const tl = gsap.timeline();
  tl.add(maskAnimation()).add(loadingAnimationOut(), 0.2).to(
    contentEl,
    {
      opacity: 1,
      duration: 0.1,
    },
    0.8
  );
};

const loadingAnimation = () => {
  gsap
    .timeline({
      onComplete: () => {
        isLoadingAnimationEnd = true;
        if (isLoaded) entranceAnimation();
      },
      defaults: {
        ease: "power3.inOut",
        duration: 2,
      },
    })
    .to(preloaderTitle, {
      y: "0%",
      opacity: 1,
      delay: 1,
      ease: "bounce",
    })
    .to(preloaderTitle, {
      x: -400,
      delay: 2,
      opacity: 0,
    })
    .to(preloaderSubtitle, {
      x: "0%",
      opacity: 1,
      delay: 1,
    })
    .to(preloaderSubtitle, {
      y: -300,
      delay: 2,
      opacity: 0,
    })
    .to(preloaderText, {
      x: "0%",
      opacity: 1,
    })
    .to(preloaderText, {
      y: -window.innerHeight / 2,
      duration: 10,
    })
    .to(preloaderText, {
      y: -window.innerHeight,
      opacity: 0,
    });
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
    .to(signature, { x: "100%", opacity: 0 }, "start")
    .to(contentEl, {
      x: "-100%",
      opacity: 0,
      height: 0,
    })
    .add(() => {
      contentEl.classList.add("content--hidden");
    }, "start")

    .addLabel("start", 0)
    .set(
      [item.preview.DOM.innerElements, item.preview.DOM.backCtrl],
      {
        opacity: 0,
      },
      "start"
    )
    .to(
      overlayRows,
      {
        scaleY: 1,
      },
      "start"
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
    )
    .to(signature, { x: "0%", opacity: 1, color: "white" });
  setTimeout(() => {
    window.scrollTo(0, 0);
  }, 1000);
};

const closeItem = (item) => {
  gsap
    .timeline({
      defaults: {
        duration: 2,
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
        // ease: "expo",
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
        duration: 1,
        x: "0%",
        opacity: 1,
        height: "auto",
        ease: "power2.inOut",
      },
      "<1"
    )
    .to(signature, { color: "black" });
};

for (const item of items) {
  // Opens the item preview
  item.DOM.link.addEventListener("click", () => {
    openItem(item);
  });

  // Closes the item preview
  item.preview.DOM.backCtrl.addEventListener("click", () => closeItem(item));
}
