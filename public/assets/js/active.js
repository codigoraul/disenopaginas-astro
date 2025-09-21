"use strict";

/* ---------------------
   [Master JavaScript]
   Template Name: Softora - IT Solutions & Technology HTML Template
   Version: 1.0.0
   Author: Nano Theme
--------------------- */

/* ---------------------
   [Table of Contents]

   1. Core Features
      1.1.0 Sticky Header (sticky-header)
      1.2.0 Mobile Dropdown Menu (mobile-menu)
      1.3.0 Anchor Prevent Default (anchor-prevent)
      1.4.0 Search Form (search-form)
   2. Sliders & Carousels
      2.1.0 Service Swiper Slide (service-slide)
      2.2.0 Service Swiper Slide Two (service-slide-two)
      2.3.0 Project Swiper Slide (portfolio-swiper)
      2.4.0 Project Two Swiper Slide (portfolio-two-swiper)
      2.5.0 Testimonial Swiper Slide (testimonial-swiper)
      2.6.0 Testimonial Swiper Slide Two (testimonial-swiper-two)
      2.7.0 Testimonial Swiper Slide Three (testimonial-swiper-three)
      2.8.0 Team Swiper Slide (team-swiper)
   3. UI Enhancements
      3.1.0 Counter Up (counter-up)
      3.2.0 Scroll to Top (scroll-top)
      3.3.0 Video Popup
      3.4.0 Isotope
      3.5.0 Rotating Image
      3.6.0 Progress Bar
      3.7.0 Pricing Plan Switching
      3.8.0 Copyright Year
      3.9.0 WOW Activation
      3.10.0 Tooltip Activation
      3.11.0 Toast Activation
      3.12.0 Popover Activation
      3.13.0 Preloader
--------------------- */

// 1.1 Sticky Header

const navarToggler = document.querySelector('.navbar-toggler');
const header = document.querySelector('.header-area');

if (navarToggler) {
    navarToggler.addEventListener('click', () => {
        header.classList.toggle('mobile-menu-open');
    });
}

if (header) {
    function stickyNavigation() {
        if (window.pageYOffset > 10) {
            header.classList.add('sticky-on');
        } else {
            header.classList.remove('sticky-on');
        }
    }

    window.addEventListener('load', stickyNavigation);
    window.addEventListener('scroll', stickyNavigation);
}

// 1.2 Mobile Dropdown Menu - Deshabilitada para usar la funcionalidad de Bootstrap
// La funcionalidad de menú desplegable se maneja directamente con Bootstrap

// 1.3 Prevenir comportamiento por defecto solo en enlaces vacíos que no sean menús
const emptyAnchors = document.querySelectorAll('a[href="#"]:not([data-bs-toggle]):not([role="button"])');
emptyAnchors.forEach(anchor => {
    // No hacer nada con los enlaces que ya tienen manejadores de clic
    if (!anchor.hasAttribute('onclick')) {
        anchor.addEventListener('click', e => {
            e.preventDefault();
        });
    }
});

// 1.4 Search Form

const searchButton = document.getElementById('searchButton');
const searchClose = document.getElementById('searchClose');
const searchFormPopup = document.querySelector('.search-form-popup');
const searchOverlay = document.getElementById('searchOverlay');

if (searchButton) {
    searchButton.addEventListener('click', () => {
        searchFormPopup.classList.add('open');
        searchOverlay.classList.add('open');
    });
    searchClose.addEventListener('click', () => {
        searchFormPopup.classList.remove('open');
        searchOverlay.classList.remove('open');
    });
}

// 2.1.0 Service Swiper Slide

const serviceSwiper = document.querySelector('.service-swiper-slider');

if (serviceSwiper) {
    new Swiper('.service-swiper-slider', {
        loop: true,
        slidesPerView: 3,
        spaceBetween: 30,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".service-pagination",
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 0,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });
}

// 2.2.0 Service Swiper Slide Two

const serviceSwiperTwo = document.querySelector('.service-swiper-slider-two');

if (serviceSwiperTwo) {
    new Swiper('.service-swiper-slider-two', {
        loop: true,
        slidesPerView: 6,
        spaceBetween: 30,
        centeredSlides: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".service-pagination-two",
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            480: {
                slidesPerView: 1.5,
                spaceBetween: 20,
            },
            576: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2.5,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            1200: {
                slidesPerView: 4,
                spaceBetween: 30,
            },
            1400: {
                slidesPerView: 5,
                spaceBetween: 30,
            },
            1800: {
                slidesPerView: 6,
                spaceBetween: 30,
            },
        },
    });
}

// 2.3.0 Project Swiper Slide

const projectSwiper = document.querySelector('.project-swiper');

if (projectSwiper) {
    new Swiper('.project-swiper', {
        loop: true,
        slidesPerView: 5,
        spaceBetween: 20,
        navigation: {
            nextEl: '.project-button-next',
            prevEl: '.project-button-prev',
        },
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            480: {
                slidesPerView: 2,
                spaceBetween: 15,
            },
            576: {
                slidesPerView: 3,
                spaceBetween: 15,
            },
            768: {
                slidesPerView: 4,
                spaceBetween: 15,
            },
            1024: {
                slidesPerView: 5,
                spaceBetween: 20,
            },
            1200: {
                slidesPerView: 5,
                spaceBetween: 20,
            },
        },
    });
}

// 2.4.0 Project Two Swiper Slide

const swiperInstances = [];
const projectTwoSwipers = document.querySelectorAll('.project-two-swiper');

if (projectTwoSwipers.length > 0) {
    projectTwoSwipers.forEach((swiperEl, index) => {
        const projectSwiper = new Swiper(swiperEl, {
            loop: true,
            slidesPerView: 'auto',
            spaceBetween: 30,
            pagination: {
                el: swiperEl.querySelector('.project-two-pagination'),
                clickable: true,
            },
            grabCursor: true,
            watchSlidesProgress: true,
        });

        swiperInstances.push(projectSwiper);

        swiperEl.querySelectorAll('.project-two-card').forEach(slide => {
            slide.addEventListener('click', () => {
                swiperEl.querySelectorAll('.project-two-card').forEach(s => {
                    s.classList.remove('slide-expand');
                });
                slide.classList.add('slide-expand');
            });
        });
    });
}

const tabSwipers = document.querySelectorAll('[data-bs-toggle="tab"]');

if (tabSwipers.length > 0) {
    tabSwipers.forEach(tabBtn => {
        tabBtn.addEventListener('shown.bs.tab', (e) => {
            const targetTab = document.querySelector(e.target.getAttribute('data-bs-target'));
            const targetSwiperEl = targetTab.querySelector('.project-two-swiper');

            if (targetSwiperEl) {
                const swiperIndex = Array.from(document.querySelectorAll('.project-two-swiper')).indexOf(targetSwiperEl);
                const projectSwiper = swiperInstances[swiperIndex];

                setTimeout(() => {
                    projectSwiper.update();
                }, 100);
            }
        });
    });
}

// 2.5.0 Testimonial Swiper Slide

const testimonialSwiper = document.querySelector('.testimonial-swiper');

if (testimonialSwiper) {
    new Swiper('.testimonial-swiper', {
        loop: true,
        spaceBetween: 0,
        slidesPerView: 1,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".testimonial-pagination",
            clickable: true,
        },
        navigation: {
            nextEl: '.testimonial-button-next',
            prevEl: '.testimonial-button-prev',
        },
    });
}

// 2.6.0 Testimonial Swiper Slide Two

const testimonialSwiperTwo = document.querySelector('.testimonial-swiper-two');

if (testimonialSwiperTwo) {
    new Swiper('.testimonial-swiper-two', {
        loop: true,
        spaceBetween: 30,
        slidesPerView: 3,
        centeredSlides: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: ".testimonial-swiper-two-pagination",
            clickable: true,
        },
        breakpoints: {
            320: {
                slidesPerView: 1,
                spaceBetween: 10,
            },
            480: {
                slidesPerView: 1,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            1200: {
                slidesPerView: 3,
                spaceBetween: 30,
            },
        },
    });
}

// 2.7.0 Team Swiper Slide

const teamSwiper = document.querySelector('.team-swiper');

if (teamSwiper) {
    new Swiper('.team-swiper', {
        loop: true,
        spaceBetween: 30,
        slidesPerView: 4,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        navigation: {
            nextEl: '.team-button-next',
            prevEl: '.team-button-prev',
        },
        breakpoints: {
            320: {
                slidesPerView: 1.5,
                spaceBetween: 10,
            },
            480: {
                slidesPerView: 2,
                spaceBetween: 20,
            },
            576: {
                slidesPerView: 2.5,
                spaceBetween: 20,
            },
            768: {
                slidesPerView: 3,
                spaceBetween: 20,
            },
            992: {
                slidesPerView: 4,
                spaceBetween: 20,
            }
        },
    });
}

// 3.1.0 Counter Up

const counterElements = document.querySelectorAll('.counter');

if (counterElements.length > 0) {
    const counterUp = window.counterUp.default;

    const callback = (entries) => {
        entries.forEach(entry => {
            const counterElement = entry.target;
            if (entry.isIntersecting && !counterElement.classList.contains('is-visible')) {
                counterUp(counterElement, {
                    duration: 2000,
                    delay: 20
                });
                counterElement.classList.add('is-visible');
            }
        });
    };

    const IO = new IntersectionObserver(callback, {
        threshold: 1
    });
    counterElements.forEach(element => IO.observe(element));
}

// 3.2.0 Scroll to Top

const scrollButton = document.getElementById('scrollTopButton');
const topDistance = 600;

if (scrollButton) {
    window.addEventListener('scroll', () => {
        if (document.body.scrollTop > topDistance || document.documentElement.scrollTop > topDistance) {
            scrollButton.classList.add('scrolltop-show');
            scrollButton.classList.remove('scrolltop-hide');
        } else {
            scrollButton.classList.add('scrolltop-hide');
            scrollButton.classList.remove('scrolltop-show');
        }
    });

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    });

    function updateScrollProgress() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPercent = (scrollY / (documentHeight - windowHeight)) * 100;
        scrollButton.style.setProperty('--scroll-progress', `${scrollPercent}%`);
    }

    window.addEventListener('scroll', updateScrollProgress);
}

// 3.3.0 Video Popup

const videoPopup = document.getElementById("videoPopup");
const videoFrame = document.getElementById("videoFrame");
const closeBtn = document.getElementById("videoCloseButton");
const videoBtns = document.querySelectorAll(".video-btn");

if (closeBtn && videoBtns.length > 0) {
    videoBtns.forEach(button => {
        button.addEventListener("click", function () {
            let videoUrl = this.getAttribute("data-video");

            if (videoUrl) {
                let separator = videoUrl.includes("?") ? "&" : "?";

                if (videoUrl.includes("youtu.be")) {
                    let videoId = videoUrl.split("/").pop();
                    videoUrl = `https://www.youtube.com/embed/${videoId}`;
                }

                if (videoUrl.includes("youtube.com/watch")) {
                    let videoId = new URL(videoUrl).searchParams.get("v");
                    videoUrl = `https://www.youtube.com/embed/${videoId}`;
                }

                if (videoUrl.includes("youtube.com") || videoUrl.includes("vimeo.com")) {
                    videoUrl += `${separator}autoplay=1`;
                }

                videoFrame.src = videoUrl;
                videoFrame.setAttribute("allow", "autoplay; encrypted-media");
                videoPopup.style.display = "flex";
            }
        });
    });

    closeBtn.addEventListener("click", () => {
        videoPopup.style.display = "none";
        videoFrame.src = "";
    });

    window.addEventListener("click", (event) => {
        if (event.target === videoPopup) {
            videoPopup.style.display = "none";
            videoFrame.src = "";
        }
    });
}

// 3.4.0 Isotope

const grids = document.querySelectorAll('.softora-filter');

if (grids.length > 0) {
    grids.forEach(grid => {
        imagesLoaded(grid, () => {
            const iso = new Isotope(grid, {
                itemSelector: '.filter-item',
                percentPosition: true,
                layoutMode: 'masonry',
                masonry: {
                    columnWidth: '.filter-item'
                }
            });

            const filtersElem = grid.closest('.softora-container').querySelector('.softora-filter-nav');

            if (filtersElem) {
                filtersElem.addEventListener('click', (event) => {
                    if (!event.target.matches('button')) return;
                    const filterValue = event.target.getAttribute('data-filter');
                    iso.arrange({
                        filter: filterValue
                    });
                });

                const radioButtonGroup = (buttonGroup) => {
                    buttonGroup.addEventListener('click', (event) => {
                        if (!event.target.matches('button')) return;
                        buttonGroup.querySelector('.active').classList.remove('active');
                        event.target.classList.add('active');
                    });
                };

                radioButtonGroup(filtersElem);
            }
        });
    });
}

// 3.5.0 Rotating Image

const rotatingImages = document.querySelectorAll('.rotatingImage');

if (rotatingImages.length > 0) {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const rotateValue = scrollTop % 360;
        rotatingImages.forEach(image => {
            image.style.transform = `rotate(${rotateValue}deg)`;
        });
    });
}

// 3.6.0 Progress Bar

const progressBars = document.querySelectorAll('.progress-bar');

if (progressBars.length > 0) {
    progressBars.forEach(function (progressBar) {
        const value = parseInt(progressBar.getAttribute('data-value'), 10); // Added radix

        progressBar.style.width = value + '%';
        const spanElements = progressBar.closest('.progress-item').querySelectorAll('.progress-info span');
        if (spanElements.length > 1) {
            const percentSpan = spanElements[1];
            percentSpan.textContent = value + '%';
            percentSpan.style.marginRight = (100 - value) + '%';
        }
    });
}

// 3.7.0 Pricing Plan Switching

const switchButtons = document.querySelectorAll(".pricing-plan-switching .btn");
const priceCards = document.querySelectorAll(".price-table-one");

if (switchButtons.length > 0 && priceCards.length > 0) {
    switchButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            switchButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const isYearly = btn.textContent.trim().toLowerCase() === "yearly";

            priceCards.forEach(card => {
                const priceDisplay = card.querySelector(".price-display");
                const priceAmountEl = card.querySelector(".price-amount");
                const priceTypeEl = card.querySelector(".price-type");
                priceDisplay.classList.add("fade-out");

                setTimeout(() => {
                    const newPrice = isYearly ? card.dataset.yearly : card.dataset.monthly;
                    const newLabel = isYearly ? "/Year" : "/Month";
                    priceAmountEl.textContent = `$${newPrice}`;
                    priceTypeEl.textContent = newLabel;
                    priceDisplay.classList.remove("fade-out");
                    priceDisplay.classList.add("fade-in");
                    setTimeout(() => {
                        priceDisplay.classList.remove("fade-in");
                    }, 400);
                }, 300);
            });
        });
    });
}

// 3.8.0 Copyright Year

const year = document.getElementById("year");
if (year) {
    const currentYear = new Date().getFullYear();
    year.textContent = currentYear;
}

// 3.9.0 WOW Activation

const wowjs = document.querySelectorAll('.wow').length;

if (wowjs > 0) {
    new WOW().init();
}

// 3.10 Tooltip Activation

let softoraTooltip = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
let tooltipList = softoraTooltip.map(function (sbTooltip) {
    return new bootstrap.Tooltip(sbTooltip);
});

// 3.11 Toast Activation

let softoraToast = [].slice.call(document.querySelectorAll('.toast'));
let toastList = softoraToast.map(function (sbToast) {
    return new bootstrap.Toast(sbToast);
});
toastList.forEach(toast => toast.show());

// 3.12 Popover Activation

let softoraPopover = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
let popoverList = softoraPopover.map(function (sbPopover) {
    return new bootstrap.Popover(sbPopover);
});

// 3.13 Preloader

const preloader = document.getElementById('preloader');

if (preloader) {
    window.addEventListener('load', function () {
        let fadeOut = setInterval(function () {
            if (!preloader.style.opacity) {
                preloader.style.opacity = 1;
            }
            if (preloader.style.opacity > 0) {
                preloader.style.opacity -= 0.1;
            } else {
                clearInterval(fadeOut);
                preloader.remove();
            }
        }, 100);
    });
}