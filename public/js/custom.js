/** * custom.js - Feane Restaurant Project
 */

// 1. მიმდინარე წლის ავტომატური განახლება
(function () {
    const updateYear = () => {
        const yearEl = document.querySelector("#displayYear");
        if (yearEl) {
            yearEl.innerHTML = new Date().getFullYear();
        }
    };
    updateYear();
    document.addEventListener("DOMContentLoaded", updateYear);
})();

// 2. Isotope ფილტრაცია (მენიუსთვის)
$(window).on('load', function () {
    if (typeof $ !== 'undefined' && $.fn.isotope && $(".grid").length > 0) {
        var $grid = $(".grid").isotope({
            itemSelector: ".all",
            percentPosition: false,
            masonry: {
                columnWidth: ".all"
            }
        });

        $('.filters_menu li').click(function () {
            $('.filters_menu li').removeClass('active');
            $(this).addClass('active');

            var data = $(this).attr('data-filter');
            $grid.isotope({
                filter: data
            });
        });
    }
});

// 3. ბიბლიოთეკების ინიციალიზაცია (Nice Select, Owl Carousel, Bootstrap Carousel)
$(document).ready(function () {
    
    // Nice Select-ის შემოწმება
    if (typeof $.fn.niceSelect !== 'undefined' && $('select').length > 0) {
        $('select').niceSelect();
    }

    // Owl Carousel (კლიენტების მიმოხილვისთვის)
    if (typeof $.fn.owlCarousel !== 'undefined' && $(".client_owl-carousel").length > 0) {
        $(".client_owl-carousel").owlCarousel({
            loop: true,
            margin: 0,
            dots: false,
            nav: true,
            autoplay: true,
            autoplayHoverPause: true,
            navText: [
                '<i class="fa fa-angle-left" aria-hidden="true"></i>',
                '<i class="fa fa-angle-right" aria-hidden="true"></i>'
            ],
            responsive: {
                0: { items: 1 },
                768: { items: 2 },
                1000: { items: 2 }
            }
        });
    }

    // Bootstrap Carousel-ის ავტომატური გადასვლის იძულებითი ჩართვა
    if (typeof $.fn.carousel !== 'undefined' && $('#customCarousel1').length > 0) {
        $('#customCarousel1').carousel({
            interval: 3000, // 3 წამი
            ride: 'carousel'
        });
    }
});

/** Google Map ფუნქცია **/
function myMap() {
    var mapElement = document.getElementById("googleMap");
    if (mapElement && typeof google !== 'undefined') {
        var mapProp = {
            center: new google.maps.LatLng(40.712775, -74.005973),
            zoom: 18,
        };
        new google.maps.Map(mapElement, mapProp);
    }
}