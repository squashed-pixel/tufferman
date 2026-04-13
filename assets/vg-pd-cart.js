VGTierApp.CartPage.Show_CalculateTier = function () {

    var cartItemsCart = commonFields_CD.cartItemsCart, variantIdsToSend = [], minimumDiscountSubtotal = 0, priceDiff = 0;

    var TieredPricingCart = function (cartItems, isUpdate) {
        variantIdsToSend = []; minimumDiscountSubtotal = 0; priceDiff = 0; var updated_total_price = 0;
        commonFields_CD.original_total_price = 0;
        for (k = 0; k < cartItems.length; k++) {
            var item = cartItems[k], isInRange = true; item.original_line_price = item.original_price * item.quantity; item.original_line_price = Number(item.original_line_price.toFixed(2));
            if (item.tiers != "" && item.tiers.split(',')[5] === 'true' && globalFields.StartEndDateValid(item.tiers.split(','))) {
                var rslt = CalculateTier(item.original_price, item.original_line_price, item.quantity, item.tiers.split(','), updated_total_price, isUpdate, true, k, cartItems, item.variant_id);
                updated_total_price = rslt[0]; isInRange = rslt[1];
                if (rslt[1]) {
                    updated_total_price += item.original_line_price;
                }
            }
            else {
                updated_total_price += item.original_line_price;
            }
            if (!isInRange) {
                minimumDiscountSubtotal += item.original_line_price; variantIdsToSend.push(item.variant_id);
            }
            commonFields_CD.original_total_price += item.original_line_price;
        }
        commonFields_CD.original_total_price = Number(commonFields_CD.original_total_price.toFixed(2));
        UpdateCartSubtotal(isUpdate, Number(updated_total_price.toFixed(2)), commonFields_CD.original_total_price);
        priceDiff = Number((commonFields_CD.original_total_price - updated_total_price).toFixed(2));
        UpdateSavingMessage(isUpdate); cartItemsCart = cartItems;
		if(priceDiff > 0){
        jQuery('#vg-chckout-btn').show();
        jQuery('.button.solid.vg-primary').hide();
      }
      else{
        jQuery('#vg-chckout-btn').hide();
        jQuery('.button.solid.vg-primary').show();
      }
    }

    var CalculateTier = function (original_price, original_line_price, quantity, splitTierPricing, updated_total_price, isUpdate, isNotInRange, index, cartItems, variant_id) {
        var updated_line_price = 0;
        for (i = 6; i < splitTierPricing.length; i++) {
            var createdOn = splitTierPricing[1].split('-')[0], createdOnId = splitTierPricing[1].split('-')[1], allVariantItemQty = 0;
            var tierRange = splitTierPricing[i].split('=')[0], tierPrice = splitTierPricing[i].split('=')[1];
            var minTier = parseInt(tierRange.split("-")[0]), maxTier = tierRange.split("-")[1] != 'max' ? parseInt(tierRange.split("-")[1]) : tierRange.split("-")[1];
            var updated_price = 0, condition1 = false, condition2 = false;

            if (createdOn === 'product' || createdOn === 'collection') {
                var arr = createdOn === 'product' ? jQuery.grep(cartItems, function (n) { return (n.product_id === createdOnId); }) : jQuery.grep(cartItems, function (n) { return (n.collection_id === createdOnId); });
                for (j = 0; j < arr.length; j++) { allVariantItemQty += arr[j].quantity; }
                if (allVariantItemQty >= minTier) { condition1 = true; }
                if (maxTier == "max") { condition2 = true; }
                else if (allVariantItemQty <= maxTier) { condition2 = true; }
            }
            else {
                if (quantity >= minTier) { condition1 = true; }
                if (maxTier == "max") { condition2 = true; }
                else if (quantity <= maxTier) { condition2 = true; }
            }

            if (condition1 && condition2) {
                isNotInRange = false;
                if (splitTierPricing[0].trim() == 'percentage') {
                    var originalPriceCut = Number((parseFloat((parseFloat(tierPrice) / 100) * original_price)).toFixed(2));
                    updated_price = Number((original_price - originalPriceCut).toFixed(2));
                }
                else if (splitTierPricing[0].trim() == 'fixed') {
                    updated_price = Number((original_price - parseFloat(tierPrice)).toFixed(2));
                }
                else if (splitTierPricing[0].trim() == 'fixed_price') {
                    updated_price = Number((parseFloat(tierPrice)).toFixed(2));
                }

                if (updated_price < 0) { updated_price = 0; }
                updated_line_price = Number((updated_price * quantity).toFixed(2))
                updated_total_price += updated_line_price;
                UpdateCartItem(isUpdate, updated_price, updated_line_price, index, variant_id, original_price, original_line_price, isNotInRange, cartItems[index].productId);
            }
        }
        if (isNotInRange) {
            UpdateCartItem(isUpdate, original_price, original_line_price, index, variant_id, original_price, original_line_price, isNotInRange, cartItems[index].productId);
        }
        return [updated_total_price, isNotInRange];
    }

    var UpdateCartItem = function (isUpdate, updated_price, updated_line_price, index, variantId, original_price, original_line_price, isNotInRange, productId) {
        if(localStorage.getItem('VAT') == null) {
            localStorage.setItem('VAT', 'Exclude');
        }
        if (isUpdate) {
            const vat_text = localStorage.getItem('VAT') === 'Exclude' ? window.vat_check.exc_vat_text : window.vat_check.inc_vat_text;
            const correct_updated_line_price = localStorage.getItem('VAT') === 'Exclude' ? updated_line_price / 1.2 : updated_line_price;
            const correct_original_line_price= localStorage.getItem('VAT') === 'Exclude' ? original_line_price / 1.2 : original_line_price;
            const correct_updated_price = localStorage.getItem('VAT') === 'Exclude' ? updated_price / 1.2 : updated_price;
            const correct_original_price = localStorage.getItem('VAT') === 'Exclude' ? original_price / 1.2 : original_price;
            if (isNotInRange || (updated_price == original_price)) {
                // setTimeout(function () {
                // jQuery('.upsell-form .mini-cart__recap-price-line > .mini-price-js').eq(index).html(`<span class="price price--highlight mini-price-js" data-orig-price="${globalFields.formatMoney(correct_updated_line_price.toFixed(2), globalFields.amount)}">
                //     ${globalFields.formatMoney(correct_updated_line_price.toFixed(2), globalFields.amount)}
                // </span>`
                // );
                //  }, 500);	
                
                // jQuery('td.line-item__product-info .line-item__price-list').eq(index).html(`<span class="line-item__price line-item__price--highlight price-js">
                //     ${globalFields.formatMoney(correct_updated_price.toFixed(2), globalFields.amount)}
                // </span>
                // <div>
                //     <span class="js-price-text">${vat_text}</span>
                // </div>`);
              
                setTimeout(function () {
                jQuery('li.upsell-cart__property:last-child').eq(index).html(`<span class="line-item__price line-item__price--highlight price-js">
                        ${globalFields.formatMoney(correct_updated_price.toFixed(2), globalFields.amount)}
                    </span>
                    <div>
                        <span class="js-price-text">${vat_text}</span>
                    </div>`);
                }, 500);	
              
            } else {
              setTimeout(function () {
                jQuery('.upsell-form .mini-cart__recap-price-line > .mini-price-js').eq(index).html(`<span class="price price--highlight mini-price-js" data-orig-price="${globalFields.formatMoney(correct_updated_line_price.toFixed(2), globalFields.amount)}">
                    ${globalFields.formatMoney(correct_updated_line_price.toFixed(2), globalFields.amount)}
                    <span class="price-text">INC. VAT</span>
                </span>
                <span class="price price--compare line-item__price--compare mini-price-js" data-orig-price="${globalFields.formatMoney(correct_original_line_price.toFixed(2), globalFields.amount)}">
                    ${globalFields.formatMoney(correct_original_line_price.toFixed(2), globalFields.amount)}
                </span>`);
                }, 500);
                

                // jQuery('td.line-item__product-info .line-item__price-list').eq(index).html(`<span class="line-item__price line-item__price--highlight price-js">
                //     ${globalFields.formatMoney(correct_updated_price.toFixed(2), globalFields.amount)}</span>
                // <span class="line-item__price line-item__price--compare price-js">
                //     ${globalFields.formatMoney(correct_original_price.toFixed(2), globalFields.amount)}
                // </span>`);

              setTimeout(function () {
              jQuery('li.upsell-cart__property:last-child').eq(index).html(`<span class="line-item__price line-item__price--highlight price-js">
                    ${globalFields.formatMoney(correct_updated_price.toFixed(2), globalFields.amount)}
                    <span class="price-text">INC. VAT</span></span>
                <span class="line-item__price line-item__price--compare price-js">
                    ${globalFields.formatMoney(correct_original_price.toFixed(2), globalFields.amount)}
                </span>`);
                 }, 500);	
            }
            jQuery('td.line-item__line-price').eq(index).html(`
            <span class="price-js">
                ${globalFields.formatMoney(correct_updated_line_price.toFixed(2), globalFields.amount)}
            </span>
            <span class="price-text locale-selector__value">${vat_text}</span>`);
        }
    }

    var UpdateCartSubtotal = function (isUpdate, updated_total_price, original_total_price) {
        if (isUpdate) {
            if (original_total_price != updated_total_price) {
                // If discounted

                // document.addEventListener('cart:rerendered', function(event) {
                // });
            } else {
                // If not discounted

                // document.addEventListener('cart:rerendered', function(event) {
                // });
            }

            const vatRate = 1.2;
            const exc_correct_price = updated_total_price / vatRate;

            jQuery(
              ".cart-recap__price-line .inc-vat span.cart-recap__price-line-price"
            ).html(
              globalFields.formatMoney(
                updated_total_price.toFixed(2),
                globalFields.amount
              )
            );
            jQuery(
              ".cart-recap__price-line .ex-vat span.cart-recap__price-line-price"
            ).html(
              globalFields.formatMoney(
                exc_correct_price.toFixed(2),
                globalFields.amount
              )
            );
        }
    }

    var UpdateSavingMessage = function (isUpdate) {
        if (priceDiff > 0 && isUpdate && globalFields.isCartPage) {
            jQuery('.cart-recap__amount-saved').html(jQuery('#vg-saving-message').text() + " " + globalFields.formatMoney(priceDiff.toFixed(2), globalFields.amount))
        }
        else if (globalFields.isCartPage) {
            jQuery('.cart-recap__amount-saved').html('');
        }
     }

    var CheckoutClickCart = function () {
        jQuery('form button[name="checkout"]').click(function () {
            jQuery('[name="updates[]"]').each(function () {
                var qtyValue = this.value; var idAtrbtValue = jQuery(this).attr('id'); idAtrbtValue = idAtrbtValue.split('_'); idAtrbtValue = idAtrbtValue[1];
                idAtrbtValue = idAtrbtValue.split(':'); idAtrbtValue = idAtrbtValue[0];
                for (i = 0; i < cartItemsCart.length; i++) {
                    if (cartItemsCart[i].variant_id == Number(idAtrbtValue)) { cartItemsCart[i].quantity = Number(qtyValue); }
                }
            });
            TieredPricingCart(cartItemsCart, false);
            GetCode(false);
        });
    }

    var CheckoutClickAjax = function () {
        jQuery('.mini-cart__button-container button.button.button--primary').click(function (e) {
            //e.preventDefault();
            GetCode(true);
        });
    }

    var GetCode = function (isUpper) {
        if (priceDiff > 0) {
            $.ajax({
                type: "POST", async: false, url: "https://www.vgroupapps.com/TieredPricing/api/services/GetCode",
                data: { priceDifference: priceDiff, subTotal: minimumDiscountSubtotal, variantIds: variantIdsToSend.toString() },
                success: function (result) {
                    var data_ = JSON.stringify(result); var parsed_data = JSON.parse(data_); var PRID = parsed_data.PRID;
                    var DCID = parsed_data.DCID; var DiscountCode = parsed_data.DiscountCode;
                    SetCookie("discountCodes", PRID + "-" + DCID + "-" + DiscountCode, 30);
                    if (!isUpper) {
                        DiscountCodeCookie(DiscountCode);
                        jQuery('form.cart').append('<input id="discount_input" type="hidden" name="discount" value="' + DiscountCode + '">');
                    } else {
                        DiscountCodeCookie(DiscountCode);
                        jQuery('#ajaxifyCart form.cart-wrapper').append('<input id="discount_input" type="hidden" name="discount" value="' + DiscountCode + '">');
                        //window.location.href = '/checkout?discount=' + DiscountCode;
                    }
                },
                error: function (e) { console.log(e.statusText); }
            });
        }
    }

    var DiscountCodeCookie = function (discount_code) {
        $.ajax({
            type: "HEAD", url: "/discount/" + discount_code,
            success: function (_result) { },
            error: function (e) { console.log(e.statusText); }
        })
    }

    var FetchMetafield = function (productHandle, variant_id) {
        var variantMF = "";
        if (commonFields_CD.variantsMFArray.hasOwnProperty(variant_id)) {
            variantMF = commonFields_CD.variantsMFArray[variant_id];
        }
        else if (globalFields.isProductPage && commonFields_PD.variantsMFArray_PD.hasOwnProperty(variant_id)) {
            variantMF = commonFields_PD.variantsMFArray_PD[variant_id];
        }
        else {
            jQuery.ajax({
                async: false,
                url: "/products/" + productHandle + "?view=vgmetafields",
                success: function (result) {
                    var data_ = JSON.parse(result);
                    for (var k = 0; k < data_.length; k++) {
                        var variantMetafieldChoosen = data_[k];
                        if (variantMetafieldChoosen.variantId === variant_id) {
                            if (variantMetafieldChoosen.tiers.hasOwnProperty('tieredpricing')) {
                                variantMF = variantMetafieldChoosen.tiers['tieredpricing'];
                            }
                            break;
                        }
                    }
                },
                error: function (e) { console.log(e.statusText); }
            });
        }
        return variantMF;
    }
    

    jQuery(document).ajaxComplete(function (event, xhr, settings) {
        ProcessCartResponse(settings.url, xhr.responseText, 'jQuery');
    });
  
    document.addEventListener('cart:rerendered', function(event) {
        fetch('/cart.js')
            .then(r =>  r.json().then(data => ({status: r.status, body: data})))
            .then(obj => ProcessCartResponse("/cart.js", JSON.stringify(obj.body), 'js'));
    });
  
    function ProcessCartResponse(splittedUrl, responseText, method) {
        if (splittedUrl != 'undefined' && splittedUrl != "" && splittedUrl != null) {
            splittedUrl = splittedUrl.split("?");
            if (splittedUrl[0] == "/cart.js" || splittedUrl[0] == "/cart/change.js") {
                var response = JSON.parse(responseText);
                setTimeout(function () {
                    var cartItemsCart_temp = cartItemsCart; cartItemsCart = [];
                    commonFields_CD.original_total_price = Number((response.original_total_price / 100).toFixed(2));
                    for (var i = 0; i < response.items.length; i++) {
                        var item = response.items[i];
                        var original_price = Number((item.original_price / 100).toFixed(2)), original_line_price = Number((item.original_line_price / 100).toFixed(2));
                        var item_temp = jQuery.grep(cartItemsCart_temp, function (n) { return (n.variant_id === item.variant_id); });
                        var tiers = item_temp.length != 0 ? item_temp[0].tiers : FetchMetafield(item.handle, item.variant_id);
                        var collection_id = tiers != "" && tiers.split(',')[1].split('-')[0] === 'collection' ? tiers.split(',')[1].split('-')[1] : 0;
                        var item1 = { variant_id: item.variant_id, tiers: tiers, original_price: original_price, original_line_price: original_line_price, quantity: item.quantity, product_id: (item.product_id).toString(), collection_id: collection_id };
                        cartItemsCart.push(item1);
                    }
                    TieredPricingCart(cartItemsCart, true);  CheckoutClickCart();
                    jQuery('#ajaxifyCart form.cart-wrapper button[name="checkout"]').off("click"); CheckoutClickAjax(); 
                }, 1000);
            }
        }
    }

    function SetCookie(cname, cvalue, exdays) { var d = new Date(); d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000)); var expires = "expires=" + d.toUTCString(); document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/"; }

    setTimeout(function () { TieredPricingCart(cartItemsCart, true); CheckoutClickCart(); CheckoutClickAjax(); }, 1500);
}

var commonFields_CD = new VGTierApp.CartPage.Global();
var cartObject = new VGTierApp.CartPage.Show_CalculateTier();
