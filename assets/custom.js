/**
 * Include your custom JavaScript here. 
 *
 * We also offer some hooks so you can plug your own logic. For instance, if you want to be notified when the variant
 * changes on product page, you can attach a listener to the document:
 *
 * document.addEventListener('variant:changed', function(event) {
 *   var variant = event.detail.variant; // Gives you access to the whole variant details
 * });
 *
 * You can also add a listener whenever a product is added to the cart:
 *
 * document.addEventListener('product:added', function(event) {
 *   var variant = event.detail.variant; // Get the variant that was added
 *   var quantity = event.detail.quantity; // Get the quantity that was added
 * });
 *
 * If you are an app developer and requires the theme to re-render the mini-cart, you can trigger your own event. If
 * you are adding a product, you need to trigger the "product:added" event, and make sure that you pass the quantity
 * that was added so the theme can properly update the quantity:
 *
 * document.documentElement.dispatchEvent(new CustomEvent('product:added', {
 *   bubbles: true,
 *   detail: {
 *     quantity: 1
 *   }
 * }));
 *
 * If you just want to force refresh the mini-cart without adding a specific product, you can trigger the event
 * "cart:refresh" in a similar way (in that case, passing the quantity is not necessary):
 *
 * document.documentElement.dispatchEvent(new CustomEvent('cart:refresh', {
 *   bubbles: true
 * }));
 */

var Shopify = Shopify || {};
// ---------------------------------------------------------------------------
// Money format handler
// ---------------------------------------------------------------------------
Shopify.money_format = "£{{amount}}";
Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;

  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }

  return formatString.replace(placeholderRegex, value);
};

function scrollTo(element) {
  const position = Number.isInteger(element)
    ? element
    : element.offsetTop - 200;
  window.scroll({
    behavior: "smooth",
    left: 0,
    top: position,
  });
}

const url = new URL(window.location.href);
if (url.searchParams.has("vat")) {
  const selector = url.searchParams.get("vat") == "inc" ? "Include" : "Exclude";
  localStorage.setItem("VAT", selector);
}

var includes = document.getElementsByClassName("includeVAT");
var excludes = document.getElementsByClassName("excludeVAT");

for (let i = 0; i < includes.length; i++) {
  const element = includes[i];
  element.addEventListener("click", function (event) {
    event.preventDefault();
    let urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get("sort_by");
    urlParams.delete("vat");
    window.history.pushState({}, "", url);
    localStorage.setItem("VAT", "Include");
    if (sortParam !== null) {
      urlParams.set("sort_by", sortParam);
    }
    window.location.href = "?" + urlParams.toString();
  });
}

for (let o = 0; o < excludes.length; o++) {
  const element = excludes[o];
  element.addEventListener("click", function (event) {
    event.preventDefault();
    let urlParams = new URLSearchParams(window.location.search);
    const sortParam = urlParams.get("sort_by");
    urlParams.delete("vat");
    window.history.pushState({}, "", url);
    localStorage.setItem("VAT", "Exclude");
    if (sortParam !== null) {
      urlParams.set("sort_by", sortParam);
    }
    window.location.href = "?" + urlParams.toString();
  });
}

document
  .getElementById("headerVAT")
  .addEventListener("click", function (event) {
    event.preventDefault();
    document.querySelector(".popover-desktop").classList.toggle("force-show");
  });

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function vatText() {
  const VAT = localStorage.getItem("VAT");
  if (VAT == "Include") {
    const locale_options = document.querySelectorAll(".locale-selector__value");
    if (locale_options != null) {
      for (const locale_option of locale_options) {
        locale_option.innerHTML = window.vat_check.inc_vat_text;
      }
    }
    if (document.querySelectorAll('.vat-watcher.inc-vat').length > 0) {
      for (const priceList of document.querySelectorAll('.vat-watcher.inc-vat')) {
        priceList.classList.add('active');
      }
    }
  } else {
    const locale_options = document.querySelectorAll(".locale-selector__value");
    if (locale_options != null) {
      for (const locale_option of locale_options) {
        locale_option.innerHTML = window.vat_check.exc_vat_text;
      }
    }
    if (document.querySelectorAll('.vat-watcher.ex-vat').length > 0) {
      for (const priceList of document.querySelectorAll('.vat-watcher.ex-vat')) {
        priceList.classList.add('active');
      }
    }
    if (document.querySelector('.price-lists-vat')) {
      document.querySelector('.price-lists-vat').classList.add('reverse');
    }
    if (document.querySelector('.vat-watcher-container')) {
      document.querySelector('.vat-watcher-container').classList.add('reverse');
    }
  }
}

// Change prices on page load
vatText();

// Change prices on pagination and filter change
document.addEventListener("collection:refresh", function () {
  vatText();
});

// Change prices on recently viewed load
document.addEventListener("recently-viewed:loaded", function () {
  vatText();
});

document.addEventListener("cart:rerendered", function () {
  vatText();
});

document.addEventListener("related-products:loaded", function () {
  vatText();
});

if (!customElements.get("quantity-selector")) {
  class QuantityInput extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector(".quantity-selector__value");
      this.step = this.input.getAttribute("step")
        ? this.input.getAttribute("step")
        : 1;
      this.max = this.input.getAttribute("max")
        ? parseInt(this.input.getAttribute("max"))
        : null;
      this.changeEvent = new Event("change", {
        bubbles: true,
      });
      // Create buttons
      this.subtract = this.querySelector(
        ".quantity-selector__button--decrease"
      );
      this.add = this.querySelector(".quantity-selector__button--increase");

      // Add functionality to buttons
      this.subtract.addEventListener("click", () =>
        this.change_quantity(-1 * this.step)
      );
      this.add.addEventListener("click", () =>
        this.change_quantity(1 * this.step)
      );
    }
    connectedCallback() {
      this.classList.add("buttons_added");
    }
    change_quantity(change) {
      // Get current value
      let quantity = Number(this.input.value);

      // Ensure quantity is a valid number
      if (isNaN(quantity)) quantity = 1;

      // Change quantity
      quantity += change;

      // Ensure quantity is always a number
      quantity = Math.max(quantity, 1);

      // Ensure the quantity does not exceed the max
      if (this.max) {
        if (quantity >= this.max) {
          quantity = this.max;
          this.add.setAttribute("aria-label", "No more stock");
          this.add.setAttribute("data-tooltip", "No more stock");
          this.add.setAttribute("data-tooltip-position", "bottom-left");
          this.add.setAttribute("disabled", "disabled");
          this.add.classList.add("quantity-selector__button--disabled");
        } else {
          this.add.removeAttribute("aria-label");
          this.add.removeAttribute("data-tooltip");
          this.add.removeAttribute("data-tooltip-position");
          this.add.removeAttribute("disabled");
          this.add.classList.remove("quantity-selector__button--disabled");
        }
      }

      // Output number
      this.input.value = quantity;

      this.input.dispatchEvent(this.changeEvent);
    }
  }
  customElements.define("quantity-selector", QuantityInput);
}

const variant_table_forms = document.querySelectorAll(".product-form--variant");
for (const variant_table_form of variant_table_forms) {
  variant_table_form.addEventListener("submit", function (event) {
    event.preventDefault();
    const form_data = new FormData(event.target);
    const variant_id = parseInt(form_data.get("id"));
    const quantity = parseInt(form_data.get("quantity"));

    const product_data = document.querySelector("[data-product-json]")
      ? JSON.parse(document.querySelector("[data-product-json]").textContent)
          .product
      : null;
    const variant_data = product_data.variants;
    const selected_variant = variant_data.find(
      (item) => item.id === variant_id
    );

    let formData = {
      items: [
        {
          id: variant_id,
          quantity: quantity,
        },
      ],
    };

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        document.documentElement.dispatchEvent(
          new CustomEvent("product:added", {
            bubbles: true,
            detail: {
              variant: selected_variant,
              quantity: 1,
            },
          })
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
}

var tabs = document.getElementsByClassName("tab-link");
var contents = document.getElementsByClassName("tab-content");
for (let i = 0; i < tabs.length; i++) {
  const element = tabs[i];
  element.addEventListener("click", function () {
    for (const tab of tabs) {
      tab.classList.remove("current");
    }
    for (const content of contents) {
      content.classList.remove("current");
    }
    var tab_id = this.getAttribute("data-tab");
    element.classList.add("current");
    document.getElementById(tab_id).classList.add("current");
  });
}

function getSelectedMeta() {
  const url = window.location.href;
  const newURL = url.split("_")[0];
  let metaURL = "";
  const meta_options = document.querySelectorAll(".block-swatch-list--meta");
  for (const meta_option of meta_options) {
    const selected_option = meta_option.querySelector(".url-swatch:checked");
    metaURL = metaURL + "_" + selected_option.getAttribute("data-handle");
  }
  return newURL + metaURL;
}

var swatches = document.getElementsByClassName("url-swatch");
for (let i = 0; i < swatches.length; i++) {
  const swatch = swatches[i];
  swatch.addEventListener("click", function () {
    window.location.href = getSelectedMeta();
  });
}

const toggle_buttons = document.querySelectorAll("[data-toggle]");
for (const toggle_button of toggle_buttons) {
  toggle_button.addEventListener("click", function (event) {
    event.preventDefault();
    const this_toggle = toggle_button.getAttribute("data-toggle");
    const this_toggle_format = toggle_button.getAttribute("data-toggle-format");
    const toggle_element = document.getElementById(this_toggle);
    if (this_toggle_format == "inline") {
      if (toggle_element.style.display == "inline") {
        toggle_element.style.display = "none";
        toggle_button.textContent = "Read More";
      } else {
        toggle_element.style.display = "inline";
        toggle_button.textContent = "Read Less";
        toggle_button.style.display = "none";
      }
    } else {
      if (toggle_element.style.display == "block") {
        toggle_element.style.display = "none";
        toggle_button.textContent = "Read More";
      } else {
        toggle_element.style.display = "block";
        toggle_button.textContent = "Read Less";
        toggle_button.style.display = "none";
      }
    }
    document.getElementById("read-less").addEventListener("click", function () {
      if (this_toggle_format == "inline") {
        toggle_button.style.display = "inline";
      } else {
        toggle_button.style.display = "block";
      }
      toggle_element.style.display = "none";
      toggle_button.textContent = "Read More";
    });
  });
}

function matchHeight(elementClass, byRow) {
  if (byRow) {
    function percentwidth(elem) {
      var pa = elem.parentElement;
      return ((elem.offsetWidth / pa.offsetWidth) * 100).toFixed(0);
    }

    let rowLength = document.getElementsByClassName(elementClass)[0];
    rowLength = rowLength.parentElement;
    var elementPerRow = 100 / percentwidth(rowLength);

    var sortableList = document.getElementsByClassName(elementClass);

    var previousNumber = 0;
    for (let i = 0; i < sortableList.length; i = i + elementPerRow) {
      var heights = [];
      for (var l = previousNumber; l < i; l++) {
        if (sortableList[l].style && sortableList[l].style.height) {
          sortableList[l].style.height = "";
        }
        heights.push(sortableList[l].clientHeight);
      }

      var topHeight = Math.max.apply(Math, heights);
      for (var l = previousNumber; l < i; l++) {
        sortableList[l].style.height = topHeight + "px";
      }

      previousNumber = i;
    }
  } else {
    var sortableList = document.getElementsByClassName(elementClass);
    if (sortableList) {
      var heights = [];
      for (var i = 0, x = sortableList.length; i < x; i++) {
        if (sortableList[i].style && sortableList[i].style.height) {
          sortableList[i].style.height = "";
        }
        heights.push(sortableList[i].clientHeight);
      }

      var max = Math.max.apply(Math, heights);

      for (var j = 0, y = sortableList.length; j < y; j++) {
        sortableList[j].style.height = max + "px";
      }
    }
  }
}

matchHeight("offer-item__inner");

window.addEventListener("load", (event) => {
  if (document.querySelector(".prod-recommendations--auto")) {
    var originalUpsell = document.getElementById("originalRecs");
    var upsellRecs = document.getElementById("upsellRecs");
    if (upsellRecs != null) {
      var upsellCheck = setInterval(function () {
        if (originalUpsell != null) {
          clearTimeout(upsellCheck);
          upsellRecs.innerHTML = originalUpsell.innerHTML;

          //Upsell Scroll Buttons
          const popupContainer = document.querySelector(
            "#upsellRecs .product-list"
          );
          const scrollLeft = document.querySelector("#scroll-left");
          const scrollRight = document.querySelector("#scroll-right");

          if (
            popupContainer &&
            popupContainer.scrollWidth <= popupContainer.clientWidth
          ) {
            scrollLeft.disabled = true;
            scrollRight.disabled = true;
            scrollLeft.style.visibility = "hidden";
            scrollRight.style.visibility = "hidden";
            document.querySelector(".upsell-scroll__arrows").style.display =
              "none";
          } else {
            scrollLeft.style.visibility = "visible";
            scrollRight.style.visibility = "visible";
            scrollLeft.disabled = false;
            scrollRight.disabled = false;
          }

          if (popupContainer) {
            popupContainer.addEventListener("scroll", () => {
              if (popupContainer.scrollWidth <= popupContainer.clientWidth) {
                scrollLeft.disabled = true;
                scrollRight.disabled = true;
                scrollLeft.style.visibility = "hidden";
                scrollRight.style.visibility = "hidden";
              } else {
                scrollLeft.style.visibility = "visible";
                scrollRight.style.visibility = "visible";
                scrollLeft.disabled = false;
                scrollRight.disabled = false;
              }
            });
          }

          scrollLeft.addEventListener("click", () => {
            popupContainer.scrollBy({
              left: -250,
              behavior: "smooth",
            });
          });

          scrollRight.addEventListener("click", () => {
            popupContainer.scrollBy({
              left: 250,
              behavior: "smooth",
            });
          });
        }
      }, 50);
    }
  }
});

function unavailableCheck(data) {
  const product_variants = document.querySelector(".product-form__variants");
  if (product_variants) {
    const product_variants_groups = product_variants.querySelectorAll(
      '.product-form__option[data-selector-type="block"]'
    );
    let changed_variant = false;

    for (let i = data.position; i < product_variants_groups.length; i++) {
      const product_variants_group = product_variants_groups[i];
      const product_variants_group_items =
        product_variants_group.querySelectorAll(".block-swatch");

      for (let n = 0; n < product_variants_group_items.length; n++) {
        const product_variants_group_item = product_variants_group_items[n];
        const next_available_option = product_variants_group.querySelector(
          ".block-swatch:not(.block-swatch--disabled) .block-swatch__radio"
        );
        const next_available_option_checked =
          product_variants_group.querySelector(
            ".block-swatch:not(.block-swatch--disabled) .block-swatch__radio:checked"
          );

        if (
          product_variants_group_item
            .getAttribute("class")
            .includes("block-swatch--disabled") &&
          !next_available_option_checked
        ) {
          if (next_available_option) {
            next_available_option.click();
          }
          changed_variant = true;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// HELPER: Update variant CODE display
// Tries multiple common selectors used across themes
// ---------------------------------------------------------------------------
function updateVariantCode(sku) {
  // Attempt 1: original ID used in this codebase
  const byId = document.getElementById("variantCode");
  if (byId) {
    byId.innerText = sku;
  }

  // Attempt 2: any element with data-variant-sku attribute
  document.querySelectorAll("[data-variant-sku]").forEach(function (el) {
    el.innerText = sku;
  });

  // Attempt 3: common class names used by themes for SKU/code display
  const codeSelectors = [
    ".variant-sku",
    ".product-sku",
    ".sku-value",
    ".product__sku-value",
    ".variant__sku",
    ".code-value",
    "[class*='sku']",
    "[class*='product-code']",
  ];
  codeSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      // Only update if the element currently contains a SKU-like value
      // (avoid clobbering unrelated elements that happen to match)
      if (el.closest(".code-display") || el.id === "variantCode") {
        el.innerText = sku;
      }
    });
  });

  // Attempt 4: the .code-display wrapper — update its visible text node / span
  document.querySelectorAll(".code-display").forEach(function (wrapper) {
    // If there is a <strong> or <span> inside, update just that child
    const inner = wrapper.querySelector("strong, span, b");
    if (inner) {
      inner.innerText = sku;
    }
  });
}

// ---------------------------------------------------------------------------
// HELPER: Update SAVE / compare-at price badge
// ---------------------------------------------------------------------------
function updateSaveBadge(variant) {
  const VAT = localStorage.getItem("VAT");
  const isIncVAT = VAT === "Include";

  const rawPrice = variant.price;
  const rawCompare = variant.compare_at_price;

  if (rawCompare && rawCompare > rawPrice) {
    const savings = rawCompare - rawPrice;

    const displaySavings = isIncVAT ? savings : savings / 1.2;
    const savingsString = Shopify.formatMoney(displaySavings, Shopify.money_format);

    // ── Approach 1: scan every element for text containing "SAVE" ──
    document.querySelectorAll("*").forEach(function (el) {
      // Only target leaf-level or near-leaf elements to avoid replacing
      // parent wrappers that contain other child elements
      if (el.children.length <= 1) {
        const txt = (el.textContent || "").trim().toUpperCase();
        if (txt.startsWith("SAVE") && txt.length < 30) {
          el.textContent = "SAVE " + savingsString;
          el.style.display = "";
        }
      }
    });

  } else {
    // No compare price — hide any SAVE badge
    document.querySelectorAll("*").forEach(function (el) {
      if (el.children.length <= 1) {
        const txt = (el.textContent || "").trim().toUpperCase();
        if (txt.startsWith("SAVE") && txt.length < 30) {
          el.style.display = "none";
        }
      }
    });
  }
}

document.addEventListener("variant:changed", function (event) {
  const variant = event.detail.variant;

  if (variant) {
    const variant_inventory = document.querySelector("[data-product-json]")
      ? JSON.parse(document.querySelector("[data-product-json]").textContent)
          .inventories[variant.id]
      : null;
    const quantity_selector = document.querySelector(
      ".product-form .quantity-selector__value"
    );
    if (quantity_selector) {
      if (
        variant.inventory_management == "shopify" &&
        variant_inventory.inventory_policy == "deny"
      ) {
        if (
          parseInt(quantity_selector.value) >
          variant_inventory.inventory_quantity
        ) {
          quantity_selector.value = variant_inventory.inventory_quantity;
        }
        const increase_button = document.querySelector(
          '.product-form button[data-action="increase-picker-quantity"]'
        );
        if (
          parseInt(quantity_selector.value) <
          variant_inventory.inventory_quantity
        ) {
          increase_button.removeAttribute("aria-label");
          increase_button.removeAttribute("data-tooltip");
          increase_button.removeAttribute("data-tooltip-position");
          increase_button.removeAttribute("disabled");
          increase_button.classList.remove(
            "quantity-selector__button--disabled"
          );
        } else if (
          parseInt(quantity_selector.value) ==
          variant_inventory.inventory_quantity
        ) {
          increase_button.setAttribute("aria-label", "No more stock");
          increase_button.setAttribute("data-tooltip", "No more stock");
          increase_button.setAttribute("data-tooltip-position", "bottom-left");
          increase_button.setAttribute("disabled", "disabled");
          increase_button.classList.add("quantity-selector__button--disabled");
        }
        quantity_selector.setAttribute(
          "max",
          variant_inventory.inventory_quantity
        );
      } else {
        quantity_selector.removeAttribute("max");
      }
    }

    // -----------------------------------------------------------------------
    // UPDATE CODE / SKU DISPLAY
    // -----------------------------------------------------------------------
    updateVariantCode(variant.sku);

    // Ensure the option summary text (e.g. Height / Width / Depth) and swatch state match the active variant
    const variantOptionContainers = document.querySelectorAll(
      ".product-form__variants"
    );

    variantOptionContainers.forEach((container) => {
      const selectedEls = container.querySelectorAll(
        ".product-form__option-name .product-form__selected-value"
      );
      if (selectedEls[0] && variant.option1) {
        selectedEls[0].textContent = variant.option1;
      }
      if (selectedEls[1] && variant.option2) {
        selectedEls[1].textContent = variant.option2;
      }
      if (selectedEls[2] && variant.option3) {
        selectedEls[2].textContent = variant.option3;
      }

      // Sync the actual radio "checked" state for all block swatches
      const optionValues = [variant.option1, variant.option2, variant.option3];
      const blockOptions = container.querySelectorAll(
        '.product-form__option[data-selector-type="block"]'
      );

      blockOptions.forEach((optionEl) => {
        // Determine which option position this block group represents (1, 2 or 3)
        let position = null;
        const anyRadio = optionEl.querySelector(".block-swatch__radio");
        if (anyRadio && anyRadio.dataset.optionPosition) {
          position = parseInt(anyRadio.dataset.optionPosition, 10);
        }
        if (!position || position < 1 || position > 3) return;

        const currentValue = optionValues[position - 1];
        if (!currentValue) return;

        optionEl
          .querySelectorAll(".block-swatch__radio")
          .forEach((input) => {
            input.checked = input.value === currentValue;
          });
      });
    });

    // Mirror disabled/enabled state from the first (mobile) form to other variant forms (e.g. desktop)
    if (variantOptionContainers.length > 1) {
      const sourceContainer = variantOptionContainers[0];
      const sourceBlockOptions = sourceContainer.querySelectorAll(
        '.product-form__option[data-selector-type="block"]'
      );

      for (let i = 1; i < variantOptionContainers.length; i++) {
        const targetContainer = variantOptionContainers[i];
        const targetBlockOptions = targetContainer.querySelectorAll(
          '.product-form__option[data-selector-type="block"]'
        );

        sourceBlockOptions.forEach((srcOpt, optIndex) => {
          const tgtOpt = targetBlockOptions[optIndex];
          if (!tgtOpt) return;

          const srcItems = srcOpt.querySelectorAll(".block-swatch");
          const tgtItems = tgtOpt.querySelectorAll(".block-swatch");

          srcItems.forEach((srcItem, itemIndex) => {
            const tgtItem = tgtItems[itemIndex];
            if (!tgtItem) return;

            const isDisabled = srcItem.classList.contains(
              "block-swatch--disabled"
            );
            tgtItem.classList.toggle("block-swatch--disabled", isDisabled);
          });
        });
      }
    }

    // -----------------------------------------------------------------------
    // UPDATE PRICES (INC VAT + EX VAT highlighted prices)
    // -----------------------------------------------------------------------
    if (typeof Shopify !== "undefined" && Shopify.formatMoney) {
      const price = variant.price;
      const exPrice = variant.price / 1.2;

      const priceString = Shopify.formatMoney(price, Shopify.money_format);
      const exPriceString = Shopify.formatMoney(exPrice, Shopify.money_format);

      // Update all INC VAT highlighted prices
      document
        .querySelectorAll(
          ".price-list.vat-watcher.inc-vat .price.price--highlight .price-js"
        )
        .forEach((el) => {
          el.textContent = priceString;
        });

      // Update all EX VAT highlighted prices
      document
        .querySelectorAll(
          ".price-list.vat-watcher.ex-vat .price.price--highlight .price-js"
        )
        .forEach((el) => {
          el.textContent = exPriceString;
        });
    }

    // -----------------------------------------------------------------------
    // UPDATE SAVE / COMPARE-AT BADGE  ← KEY FIX
    // -----------------------------------------------------------------------
    updateSaveBadge(variant);

    const upgrade_products = document.querySelectorAll(".upgrade_products");
    const current_upgrades = document.querySelectorAll(
      ".upgrade_" + variant.id
    );
    for (const upgrade_product of upgrade_products) {
      upgrade_product.setAttribute("hidden", "hidden");
      document.querySelector(".product-form__upgrade").innerText =
        localStorage.getItem("DefaultUpgradeText");
    }
    for (const current_upgrade of current_upgrades) {
      if (current_upgrade != null) {
        current_upgrade.removeAttribute("hidden");
        document.querySelector(".product-form__upgrade").innerText =
          document.querySelector(".product-form__upgrade").dataset.upgrade;
      }
    }

    localStorage.setItem("selected_variant", variant.public_title);

    const optionTexts = document.getElementsByClassName("option-text");
    for (const optionText of optionTexts) {
      optionText.classList.add("hidden");
      if (optionText.dataset.id == variant.id) {
        optionText.classList.remove("hidden");
      }
    }

    if (document.querySelector(".upsell-cart__property--price-is")) {
      document.querySelector(".upsell-cart__property--price-is").textContent =
        Shopify.formatMoney(variant.price);
    }

    // checkThumbnailsVariantId(variant.id);
    document.querySelector(".code-display").style.display = "inline-block";
  } else {
    document.querySelector(".code-display").style.display = "none";
  }

  unavailableCheck(event.detail);
});

// On initial page load, re-run the same variant sync logic so
// prices, labels, and disabled states are correct immediately.
document.addEventListener("DOMContentLoaded", function () {
  try {
    const productJsonEl = document.querySelector("[data-product-json]");
    if (!productJsonEl) return;

    const jsonData = JSON.parse(productJsonEl.textContent);
    const product = jsonData.product;
    const variants = product && product.variants ? product.variants : [];
    if (!variants.length) return;

    const params = new URLSearchParams(window.location.search);
    const variantIdParam = params.get("variant");

    let selectedVariant = null;
    if (variantIdParam) {
      const idNum = parseInt(variantIdParam, 10);
      selectedVariant = variants.find((v) => v.id === idNum);
    }

    if (!selectedVariant) {
      const selectedId = jsonData.selected_variant_id;
      selectedVariant =
        variants.find((v) => v.id === selectedId) || variants[0];
    }

    if (!selectedVariant) return;

    document.dispatchEvent(
      new CustomEvent("variant:changed", {
        bubbles: true,
        detail: {
          variant: selectedVariant,
          previousVariant: null,
          position: 1,
        },
      })
    );

    // Re-apply VAT text/formatting so labels like EX.VAT / INC.VAT are correct
    if (typeof vatText === "function") {
      vatText();
    }

    // Ensure EX.VAT label is present on page load when VAT is excluded
    try {
      const VAT = localStorage.getItem("VAT");
      if (VAT !== "Include" && window.vat_check) {
        const exText = window.vat_check.exc_vat_text || "EX. VAT";
        document
          .querySelectorAll(
            ".price-list.vat-watcher.ex-vat .js-price-text"
          )
          .forEach((el) => {
            el.textContent = exText;
          });
      }
    } catch (e2) {
      // fail silently if vat_check is not available yet
    }
  } catch (e) {
    console.error("Error initializing variant state on load", e);
  }
});

document.addEventListener("product:added", function (event) {
  const variant = event.detail.variant;
  const product = document.querySelector("[data-product-json]")
    ? JSON.parse(document.querySelector("[data-product-json]").textContent)
        .product
    : null;

  if (variant) {
    if (variant.featured_image) {
      document
        .querySelector(".upsell-product-image img")
        .setAttribute("src", variant.featured_image.src);
    }
    const add_to_cart_details = document.querySelector(
      ".upsell-cart__property-list"
    );
    if (add_to_cart_details) {
      var variantPrice = variant.price;
      var comparePrice = variant.compare_at_price;
      const VAT = localStorage.getItem("VAT");
      if(VAT != "Include") {
        variantPrice = variantPrice / 1.2;
        comparePrice = comparePrice / 1.2;
      }
      add_to_cart_details.innerHTML = "";
      const add_to_cart_details_price = document.createElement("LI");
      add_to_cart_details_price.classList.add("upsell-cart__property");

      const add_to_cart_details_price_price = document.createElement("SPAN");
      add_to_cart_details_price_price.classList.add(
        "upsell-cart__property--price-is"
      );
      add_to_cart_details_price_price.classList.add("price-js");
      add_to_cart_details_price_price.textContent =
        Shopify.formatMoney(variantPrice);
      add_to_cart_details_price.append(add_to_cart_details_price_price);

      if (variant.price < variant.compare_at_price) {
        const add_to_cart_details_price_compare =
          document.createElement("SPAN");
        add_to_cart_details_price_compare.classList.add(
          "upsell-cart__property--price-was"
        );
        add_to_cart_details_price_compare.textContent =
          Shopify.formatMoney(comparePrice);
        add_to_cart_details_price.append(add_to_cart_details_price_compare);
      }

      add_to_cart_details.innerHTML += `<li class="upsell-cart__property">Product Code: <span>${variant.sku}</span></li>`;
      if (product) {
        if (variant.option1) {
          add_to_cart_details.innerHTML += `<li class="upsell-cart__property">${product.options[0]}: <span>${variant.option1}</span></li>`;
        }
        if (variant.option2) {
          add_to_cart_details.innerHTML += `<li class="upsell-cart__property">${product.options[1]}: <span>${variant.option2}</span></li>`;
        }
        if (variant.option3) {
          add_to_cart_details.innerHTML += `<li class="upsell-cart__property">${product.options[2]}: <span>${variant.option3}</span></li>`;
        }
      }

      add_to_cart_details.append(add_to_cart_details_price);
    }
  }
});

if (template == "product") {
  const detailsTabs = document.querySelectorAll(
    ".product__description-tab-holder [data-tab]"
  );
  if (detailsTabs.length > 0) {
    function detailsTableOverflow(dt, cts) {
      //offsetWidth of the container - padding
      ct = document.querySelector(cts).offsetWidth - 30;
      if (dt.offsetWidth > ct) {
        dt.parentNode.classList.add("tab-delivery--overflow");
      } else {
        dt.parentNode.classList.remove("tab-delivery--overflow");
      }
    }

    for (const detailsTab of detailsTabs) {
      detailsTab.addEventListener("click", function () {
        const contentTabSelector = "#" + detailsTab.getAttribute("data-tab");
        const contentSelector =
          "#" + detailsTab.getAttribute("data-tab") + " table thead";
        const detailsTables = document.querySelectorAll(contentSelector);
        if (detailsTables.length > 0) {
          for (const detailsTable of detailsTables) {
            detailsTableOverflow(detailsTable, contentTabSelector);
            window.addEventListener(
              "resize",
              function () {
                detailsTableOverflow(detailsTable, contentTabSelector);
              },
              true
            );
          }
        }
      });
    }
  }

  const selected_variant = localStorage.getItem("selected_variant");
  if (selected_variant) {
    const selected_variant_array = selected_variant.split(" / ");
    const product_form_options = document.querySelectorAll(
      ".product-form__option"
    );
    for (let i = 0; i < product_form_options.length; i++) {
      const product_form_option = product_form_options[i];
      const product_form_option_radios = product_form_option.querySelectorAll(
        ".block-swatch__radio"
      );
      for (const product_form_option_radio of product_form_option_radios) {
        if (product_form_option_radio.value == selected_variant_array[i]) {
          product_form_option_radio.click();
        }
      }
    }
  }

  if (localStorage.getItem("current_scroll_seen")) {
    const has_seen_scroll = parseInt(
      localStorage.getItem("current_scroll_seen")
    );
    const current_scroll = parseInt(localStorage.getItem("current_scroll"));
    if (has_seen_scroll == 1) {
      setTimeout(() => {
        scrollTo(current_scroll);
        localStorage.removeItem("current_scroll_seen");
        localStorage.removeItem("current_scroll");
      }, 500);
    }
  }

  const metafield_links = document.querySelectorAll(
    ".metafield-variants__container a"
  );
  for (const metafield_link of metafield_links) {
    metafield_link.addEventListener("click", function (event) {
      event.preventDefault();
      const current_scroll =
        document.documentElement.scrollTop || document.body.scrollTop;
      localStorage.setItem("current_scroll", current_scroll);
      localStorage.setItem("current_scroll_seen", 1);
      window.location.href = metafield_link.getAttribute("href");
    });
  }
} else {
  localStorage.removeItem("selectedView");
  localStorage.removeItem("selected_variant");
}

if (!customElements.get("view-toggle")) {
  class ViewToggle extends HTMLElement {
    constructor() {
      super();
      // // Create buttons
      this.selectedView = localStorage.getItem("selectedView");
      this.swichers = document.querySelectorAll(".view_toggle");
      this.list = this.querySelector(".view_toggle__option--list");
      this.grid = this.querySelector(".view_toggle__option--grid");

      // // Add functionality to buttons
      this.list.addEventListener("click", () => this.change_view("list"));
      this.grid.addEventListener("click", () => this.change_view("grid"));
    }
    connectedCallback() {
      if (this.selectedView != null) {
        this.change_view(this.selectedView);
        this.change_toggles(this.selectedView);
      }
    }
    change_view(view) {
      const previous_view = view == "list" ? "grid" : "list";
      document.body.classList.remove(`template-product--${previous_view}`);
      document.body.classList.add(`template-product--${view}`);
      localStorage.setItem("selectedView", view);

      this.change_toggles(view);
    }
    change_toggles(view) {
      const previous_view = view == "list" ? "grid" : "list";
      for (const switcher of this.swichers) {
        switcher
          .querySelector(`.view_toggle__option--${previous_view}`)
          .classList.remove("selected");
        switcher
          .querySelector(`.view_toggle__option--${view}`)
          .classList.add("selected");

        const variantTable = document.getElementById("variantContainer");
        const variantOptions = document.querySelector(".product-details__left");
        if (view == "grid") {
          scrollTo(variantTable);
        } else {
          scrollTo(variantOptions);
        }
      }
    }
  }
  customElements.define("view-toggle", ViewToggle);
}

/**
 * Postcode checker custom functionality on the cart page
 */
function getCart(callback) {
  fetch("/cart.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      callback(data);
    })
    .catch(function (error) {
      console.error("Error:", error);
    });
}

if (!customElements.get("cart-form")) {
  class CartForm extends HTMLElement {
    constructor() {
      super();

      this.holidays = window.theme.date_picker_holidays;
      this.startDay = new Date();
      this.noOfDaysToAdd = 0;

      this._second = 1000;
      this._minute = this._second * 60;
      this._hour = this._minute * 60;
      this._day = this._hour * 24;

      this.collections = this.querySelectorAll(".cart-recap__collection");
      this.postcode = this.querySelector(".cart-recap__postcode--postcode");
      this.submit = this.querySelector(".cart-recap__postcode--submit");
      this.warning = this.querySelector(".cart-recap__warning");

      this.delivery_panel = this.querySelector("#delivery-method");
      this.delivery_picker_panel = this.querySelector("#delivery-picker");
      this.methods = this.querySelectorAll(".cart-recap__postcode--method");

      this.calendar_input = this.querySelector("#calendar");

      this.info_panel = this.querySelector("#hear-about-us");
      this.hear_about = this.querySelector("#where-did-you-hear-about-us");
      this.hear_about_questions = this.querySelectorAll(
        "#hear-about-us select"
      );
      this.info_second = this.querySelectorAll(".cart-information--second");

      this.checked = {
        postcode: this.postcode.value ? true : false,
        method: true,
        info: false,
        collection: false,
      };

      this.check_radios();
      this.submit.addEventListener("click", (event) =>
        this.postcode_check(event)
      );
      for (const collection of this.collections) {
        collection.addEventListener("change", () => this.check_radios());
      }
      for (const method of this.methods) {
        method.addEventListener("change", () => this.method_change(method));
      }
      for (const hear_about_question of this.hear_about_questions) {
        hear_about_question.addEventListener("change", () =>
          this.info_change()
        );
      }
    }
    connectedCallback() {
      if (this.checked.postcode) this.postcode_check();

      let count = 0;

      if (this.startDay.getDay() == 6) {
        this.startDay.setDate(this.startDay.getDate() + 2);
      } else if (this.startDay.getDay() == 0) {
        this.startDay.setDate(this.startDay.getDate() + 1);
      } else {
        if (this.startDay.getHours() >= window.theme.date_picker_cutoff) {
          if (this.startDay.getDay() == 5) {
            this.startDay.setDate(this.startDay.getDate() + 3);
          } else {
            this.startDay.setDate(this.startDay.getDate() + 1);
          }
        }
      }

      while (count <= this.noOfDaysToAdd) {
        this.startDay.setDate(this.startDay.getDate() + 1);

        if (
          this.startDay.getDay() != 0 &&
          this.startDay.getDay() != 6 &&
          !this.isHoliday(this.startDay, this.holidays)
        ) {
          count++;
        }
      }
      this.startDay.setHours(window.theme.date_picker_cutoff, 0, 0);

      let all_invalid = [
        {
          recurring: {
            repeat: "weekly",
            weekDays: "SA,SU",
          },
        },
      ];

      all_invalid = all_invalid.concat(window.theme.date_picker_holidays);

      var maxDay = new Date();
      maxDay.setMonth(maxDay.getMonth() + 3);

      const original_this = this;
      mobiscroll.datepicker("#delivery-picker", {
        theme: "ios",
        themeVariant: "light",
        dateFormat: "DD/MM/YYYY",
        animate: "fade",
        display: "center",
        showOuterDays: false,
        closeOnOverlayClick: true,
        touchUi: true,
        showOverlay: true,
        min: this.startDay,
        max: maxDay,
        invalid: all_invalid.length > 0 ? all_invalid : null,
        locale: {
          setText: "Select",
        },
        onChange: function (event, inst) {
          var dated = event.valueText.split("/");
          var dd = dated[0];
          var mm = dated[1];
          var yyyy = dated[2];
          var finaldate = dd + "/" + mm + "/" + yyyy;
          original_this.calendar_input.value = finaldate;

          original_this.checked.method = true;
          original_this.check_checkout();
        },
      });

      let openDropdown = this.hear_about.value;
      for (let i = 0; i < this.info_second.length; i++) {
        if (
          this.info_second[i].getAttribute("name").includes(openDropdown) &&
          openDropdown != ""
        ) {
          this.info_second[i].parentNode.parentNode.style.display = "block";
        } else {
          this.info_second[i].parentNode.parentNode.style.display = "none";
          this.info_second[i].selectedIndex = this.info_second[i].options[0];
        }
      }

      this.all_info_active();

      this.checked.method = true;
      this.check_checkout();
    }
    renderOptionPrices(non_mainland, total_price) {
      const option_prices = non_mainland
        ? window.theme.non_uk_mainland_postcode_prices
        : window.theme.postcode_price;

      if (non_mainland) {
        document
          .querySelectorAll(".cart-recap__postcode--method")[1]
          .closest(".form__input-row").style.display = "none";
        document.querySelector(".cart-recap__postcode__error").style.display =
          "block";
      } else {
        document
          .querySelectorAll(".cart-recap__postcode--method")[1]
          .closest(".form__input-row").style.display = "block";
        document.querySelector(".cart-recap__postcode__error").style.display =
          "none";
      }

      let hit_threshold = false;
      for (let i = 0; i < option_prices.length; i++) {
        const option_price = option_prices[i];
        const option_price_threshold =
          option_price.split("[")[0] != "up"
            ? parseInt(option_price.split("[")[0])
            : "up";
        const option_price_threshold_groups = option_price
          .split("[")[1]
          .replace("]", "");
        const option_price_threshold_groups_prices =
          option_price_threshold_groups.includes("|")
            ? option_price_threshold_groups.split("|")
            : [option_price_threshold_groups];

        if (
          (option_price_threshold > total_price &&
            option_price_threshold != "up" &&
            hit_threshold == false) ||
          (hit_threshold == false && option_price_threshold == "up")
        ) {
          hit_threshold = true;
          for (
            let index = 0;
            index < option_price_threshold_groups_prices.length;
            index++
          ) {
            const option_price_threshold_groups_price =
              option_price_threshold_groups_prices[index];
            const radio_row = document
              .querySelectorAll(".cart-recap__postcode--method")
              [index].closest(".form__input-row");
            const option_price = isNaN(
              parseInt(option_price_threshold_groups_price)
            )
              ? option_price_threshold_groups_price
              : Shopify.formatMoney(option_price_threshold_groups_price);
            const VAT = localStorage.getItem("VAT");
            var update_option_price;
            if (VAT == "Include") {
              var update_option_price =
                parseFloat(option_price.replace("£", "")) * 1.2;
            } else {
              var update_option_price = parseFloat(
                option_price.replace("£", "")
              );
            }
            if (radio_row.querySelector("span").innerHTML.includes(" - ")) {
              radio_row.querySelector("span").innerHTML =
                radio_row.querySelector("span").innerHTML.split(" - ")[0] +
                " - £" +
                update_option_price.toFixed(2);
            } else {
              radio_row.querySelector("span").innerHTML =
                radio_row.querySelector("span").innerHTML +
                " - £" +
                update_option_price.toFixed(2);
            }
          }
        }
      }
    }
    isValidPostcode(p) {
      var postcodeRegEx = /[A-Z]{1,2}[0-9]{1,2} ?[0-9][A-Z]{2}/i;
      return postcodeRegEx.test(p);
    }
    formatPostcode(p) {
      if (this.isValidPostcode(p)) {
        var postcodeRegEx = /(^[A-Z]{1,2}[0-9]{1,2})([0-9][A-Z]{2}$)/i;
        return p.replace(postcodeRegEx, "$1 $2");
      } else {
        return p;
      }
    }
    matchRuleShort(str, rule) {
      var escapeRegex = (str) =>
        str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
      return new RegExp(
        "^" + rule.split("*").map(escapeRegex).join(".*") + "$"
      ).test(str);
    }
    postcode_check(event) {
      if (event) event.preventDefault();

      let postcode_check = this.postcode.value.toLowerCase(),
        postcode_format = this.formatPostcode(postcode_check);

      let has_format = false;
      for (const postcode of window.theme.accepted_postcodes) {
        if (this.matchRuleShort(postcode_format, postcode)) {
          has_format = true;
        }
      }

      if (has_format && this.checked.collection == false) {
        // Postcode Accepted
        this.delivery_panel.style.display = "block";
        this.warning.style.display = "none";
        this.info_panel.style.display = "block";

        let has_non_uk_format = false;
        for (const postcode of window.theme.non_uk_mainland_postcodes) {
          if (this.matchRuleShort(postcode_format, postcode)) {
            has_non_uk_format = true;
          }
        }

        const original_this = this;
        getCart(function (data) {
          has_non_uk_format
            ? original_this.renderOptionPrices(true, data.original_total_price)
            : original_this.renderOptionPrices(
                false,
                data.original_total_price
              );
        });
        window.addEventListener("sc:discount.update", function (data) {
          if (data.detail.stage == "complete") {
            has_non_uk_format
              ? original_this.renderOptionPrices(
                  true,
                  data.detail.subtotalCents
                )
              : original_this.renderOptionPrices(
                  false,
                  data.detail.subtotalCents
                );
          } else if (data.detail.stage == "initial") {
            getCart(function (data) {
              has_non_uk_format
                ? original_this.renderOptionPrices(
                    true,
                    data.original_total_price
                  )
                : original_this.renderOptionPrices(
                    false,
                    data.original_total_price
                  );
            });
          }
        });

        this.checked.postcode = true;
      } else {
        // Error Message
        this.delivery_panel.style.display = "none";
        this.warning.style.display = "block";
        this.checked.postcode = false;
      }

      this.check_checkout();
    }
    method_change(postcode_form_method) {
      if (postcode_form_method.value == "select") {
        document.querySelector("#delivery-picker").style.display = "grid";
        this.checked.method = false;
        this.check_checkout();
      } else {
        document.querySelector("#delivery-picker").style.display = "none";
        this.calendar_input.value = "";
        
        this.checked.method = true;
        this.check_checkout();
      }
    }
    info_change() {
      this.openDropdown = this.hear_about.value;
      for (let i = 0; i < this.info_second.length; i++) {
        if (
          this.info_second[i]
            .getAttribute("name")
            .includes(this.openDropdown) &&
          this.openDropdown != ""
        ) {
          this.info_second[i].parentNode.parentNode.style.display = "block";
        } else {
          this.info_second[i].parentNode.parentNode.style.display = "none";
          this.info_second[i].selectedIndex = this.info_second[i].options[0];
        }
      }

      this.all_info_active();
    }
    all_info_active() {
      function isHidden(el) {
        var style = window.getComputedStyle(el);
        return style.display === "none";
      }

      let all_activated = true;

      for (const sub_field of this.hear_about_questions) {
        const sub_field_question_group = sub_field.parentElement.parentElement;

        if (!isHidden(sub_field_question_group)) {
          if (
            sub_field.value == "" ||
            sub_field.value == null ||
            sub_field.value == "Please select before checking out"
          ) {
            all_activated = false;
          }
        }
      }

      this.checked.info = all_activated;
      this.check_checkout();
    }
    check_radios() {
      for (const radio of this.collections) {
        if (radio.checked && radio.value == "Local pick up") {
          this.checked.collection = true;
        } else {
          this.checked.collection = false;
        }
      }

      if (this.checked.collection == true) {
        document.getElementById("delivery-postcode").classList.add("hidden");
        document.getElementById("hear-about-us").style.display = "block";
        document.getElementById("delivery-method").style.display = "none";
        document.getElementById("delivery-picker").style.display = "none";
        document.querySelector("#localPickup").click();
        document.querySelector(".cart-recap__postcode--method--standard").checked = true;
        document.querySelector(".cart-recap__where").style.display = "block";
        this.check_checkout();
      } else {
        const postcodeInput = document.getElementById("postcode");
        if (postcodeInput && postcodeInput.value.trim() !== "") {
            document.getElementById("delivery-method").style.display = "block";
        } else {
            document.getElementById("delivery-method").style.display = "none";
        }
        document.getElementById("delivery-postcode").classList.remove("hidden");
        this.check_checkout();
      }
    }
    check_checkout() {
      let button_string = "PLEASE ";
      if (this.checked.collection == true) {
        button_string += window.languages.postcode_check.additional_questions;
      } else if (
        this.checked.postcode == false &&
        this.checked.collection == false
      ) {
        button_string += window.languages.postcode_check.enter_postcode;
      } else if (
        this.checked.method == false &&
        this.checked.collection == false
      ) {
        button_string += window.languages.postcode_check.select_delivery;
      } else if (
        this.checked.info == false &&
        this.checked.collection == false
      ) {
        button_string += window.languages.postcode_check.additional_questions;
      }

      if (
        this.checked.postcode == true &&
        this.checked.method == true &&
        this.checked.info == true &&
        this.checked.collection == false
      ) {
        document
          .querySelector("#checkout_decoy")
          .classList.remove("button--disabled");
        document.querySelector("#checkout_decoy").removeAttribute("disabled");
        document.querySelector("#checkout_decoy").textContent =
          window.languages.postcode_check.checkout;
      } else if (this.checked.collection == true && this.checked.info == true) {
        document
          .querySelector("#checkout_decoy")
          .classList.remove("button--disabled");
        document.querySelector("#checkout_decoy").removeAttribute("disabled");
        document.querySelector("#checkout_decoy").textContent =
          window.languages.postcode_check.checkout;
      } else {
        document
          .querySelector("#checkout_decoy")
          .classList.add("button--disabled");
        document
          .querySelector("#checkout_decoy")
          .setAttribute("disabled", "disabled");
        document.querySelector("#checkout_decoy").textContent = button_string;
      }
    }
    isHoliday(dt, arr) {
      var bln = false;

      for (var i = 0; i < arr.length; i++) {
        if (this.compare(dt, arr[i])) {
          bln = true;
          break;
        }
      }

      return bln;
    }
    compare(dt1, dt2) {
      var equal = false;

      if (
        dt1.getDate() == dt2.getDate() &&
        dt1.getMonth() == dt2.getMonth() &&
        dt1.getFullYear() == dt2.getFullYear()
      ) {
        equal = true;
      }

      return equal;
    }
  }
  customElements.define("cart-form", CartForm);
}

if (document.querySelector("#checkout_decoy")) {
  document.getElementById("checkout_decoy").addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(".cart-recap__checkout").click();
  });
}

if (template == "cart") {
  const discountShow = document.querySelector(
    ".cart-recap__price-line-label--offer"
  );
  const discountIcon = document.querySelector(".add-offer");
  const discount_check = setInterval(function () {
    const discount_containers = document.querySelectorAll(
      ".scDiscount__container"
    );
    if (discount_containers.length > 0) {
      for (const discount_container of discount_containers) {
        const discount_input = discount_container.querySelector("#code");
        const discount_submit = discount_container.querySelector("#submit");

        discount_input.addEventListener("keyup", function () {
          const input_value = discount_input.value;
          if (input_value.length > 0) {
            discount_submit.style.backgroundColor = "#3ab44b";
          } else {
            discount_submit.style.backgroundColor = "#c8c8c8";
          }
        });

        if (discountShow) {
          if (!document.querySelector(".sc_simple-info__tag")) {
            discount_container.style.display = "none";
          } else {
            discountIcon.style.display = "none";
          }

          discountShow.addEventListener("click", function () {
            discount_container.style.display = "block";
            discountIcon.style.display = "none";
          });
        }
      }

      clearInterval(discount_check);
    }
  }, 100);
}

if (window.location.href.includes("?")) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const id = urlParams.get("id");

  if (id) {
    const offset = urlParams.get("offset");

    const yOffset = offset;
    const element = document.getElementById(id);
    const y =
      element.getBoundingClientRect().top + window.pageYOffset + yOffset;

    scrollTo(y);
  }
}

window.setMobileTable = function (selector) {
  const tableEl = document.querySelector(selector);
  if (tableEl) {
    const thEls = tableEl.querySelectorAll("thead th");
    const tdLabels = Array.from(thEls).map((el) => el.innerText);
    tableEl.querySelectorAll("tbody tr").forEach((tr) => {
      Array.from(tr.children).forEach((td, ndx) =>
        td.setAttribute("label", tdLabels[ndx])
      );
    });
  }
};
setMobileTable(".page__content .data-table");

const aYous = document.querySelectorAll('a[href*="youtu.be"]');
for (const aYou of aYous) {
  aYou.addEventListener("click", function (event) {
    event.preventDefault();

    const video_id = aYou.getAttribute("href").split("/").pop();
    const video_modal = document.querySelector("#video-modal");

    video_modal
      .querySelector("iframe")
      .setAttribute(
        "src",
        `https://www.youtube.com/embed/${video_id}?enablejsapi=1&version=3&playerapiid=ytplayer`
      );

    document.querySelector("#video-modal-trigger").click();
  });
}

if (!customElements.get("countdown-timer")) {
  class CountdownTimer extends HTMLElement {
    constructor() {
      super();
      this.input = this.querySelector("#countdown");
      this.holidays = window.theme.date_picker_holidays;
      this.endDate = new Date();
      this.noOfDaysToAdd = 0;

      this._second = 1000;
      this._minute = this._second * 60;
      this._hour = this._minute * 60;
      this._day = this._hour * 24;
    }
    connectedCallback() {
      let count = 0;

      if (this.endDate.getHours() >= window.theme.date_picker_cutoff) {
        this.endDate.setDate(this.endDate.getDate() + 1);
      }
      while (count <= this.noOfDaysToAdd) {
        this.endDate.setDate(this.endDate.getDate() + 1);

        if (
          this.endDate.getDay() != 0 &&
          this.endDate.getDay() != 6 &&
          !this.isHoliday(this.endDate, this.holidays)
        ) {
          count++;
        }
      }

      this.endDate.setHours(window.theme.date_picker_cutoff, 0, 0);

      const originalThis = this;
      setInterval(function () {
        originalThis.showRemaining(originalThis.input, originalThis.endDate);
      }, 1000);
    }
    showRemaining(area, endDate) {
      const now = new Date();
      const distance = endDate - now;

      if (distance < 0) {
        clearInterval(timer);
        area.innerHTML = "EXPIRED!";

        return;
      }

      const days =
        Math.floor(distance / this._day) <= 0
          ? Math.floor(distance / this._day)
          : Math.floor(distance / this._day) - 1;
      const hours = Math.floor((distance % this._day) / this._hour);
      const minutes = Math.floor((distance % this._hour) / this._minute);
      const seconds = Math.floor((distance % this._minute) / this._second);

      area.innerHTML = "";

      if (days != 0) {
        area.parentElement.style.display = "none";
      }

      if (hours != 0) {
        if (hours > 1) {
          area.innerHTML += hours + " hours ";
        } else {
          area.innerHTML += hours + " hour ";
        }
      }
      if (minutes != 0) {
        if (minutes > 1) {
          area.innerHTML += minutes + " minutes ";
        } else {
          area.innerHTML += minutes + " minute ";
        }
      }
      if (seconds != 0) {
        if (seconds > 1) {
          area.innerHTML += seconds + " seconds ";
        } else {
          area.innerHTML += seconds + " second ";
        }
      }
    }
    isHoliday(dt, arr) {
      var bln = false;

      for (var i = 0; i < arr.length; i++) {
        if (this.compare(dt, arr[i])) {
          bln = true;
          break;
        }
      }

      return bln;
    }
    compare(dt1, dt2) {
      var equal = false;

      if (
        dt1.getDate() == dt2.getDate() &&
        dt1.getMonth() == dt2.getMonth() &&
        dt1.getFullYear() == dt2.getFullYear()
      ) {
        equal = true;
      }

      return equal;
    }
  }
  customElements.define("countdown-timer", CountdownTimer);
}