VGTierApp.PDPage.DisplayTiers = function () {
    this.DisplayTiersFn = function () {
        jQuery('#tieres').remove();
        
        const variant_prices = jQuery('.variant-prices');
        if (jQuery('.custom-block-sp')) {
            jQuery('.custom-block-sp').remove();
        }
        variant_prices.each(function() {
            const variant_id = jQuery(this).attr('data-id');
            const variant_data = commonFields_PD.variantsMFArray_PD[variant_id];
            const variant_data_split = variant_data.split(",");
            if (variant_data_split[5] === 'true') {
                if (globalFields.StartEndDateValid(variant_data_split)) {
                    WriteTableFormatRows(variant_data_split, variant_id, jQuery(this));
                }
            }
        });

        var selectedVariant_ = jQuery('input[name^=id]:checked, select[name^=id], input[name=id], hidden[name^=id]', jQuery('form[action="/cart/add"]')).val();
        if (selectedVariant_ != null) {
            var tiered_ = commonFields_PD.variantsMFArray_PD[selectedVariant_];

            if (tiered_ != "" && tiered_ != undefined) {
                var tieredSplit_ = tiered_.split(",");

                if (tieredSplit_[5] === 'true') {
                    if (globalFields.StartEndDateValid(tieredSplit_)) {
                        WriteTableHeading(tieredSplit_);
                        WriteTableRows(tieredSplit_, selectedVariant_);
                    }
                }
            }

            jQuery('head').append('<style type="text/css">.variant-grid-pricing__first .price-js:not(.was-price)::before{content: "1+"; display: inline-block; margin-right: 10px; color: var(--text-color); font-weight: normal;}</style>');
        }
    }

    this.OnVariantChange = function () {
        document.addEventListener('variant:changed', debounce(displayTiers.DisplayTiersFn, 1000));

        function debounce(callback, interval) {
            let debounceTimeoutId;
          
            return function(...args) {
                clearTimeout(debounceTimeoutId);
                debounceTimeoutId = setTimeout(() => callback.apply(this, args), interval);
            };
        }
    }

    var TableHeadHtml = function (contentHtml, tableSelector, position) {
        jQuery(tableSelector).prepend(contentHtml);
    }

    var WriteTableHeading = function (tieredSplit_) {
        var tieredType = tieredSplit_[0].trim(), tableSelector = 'form.product-form .product-form__buttons';
        if (commonFields_PD.tableSetting == "table1") {
            TableHeadHtml('<div id="tieres" class="table-first"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th></tr></thead><tbody id="table-1-data"></tbody></table></div>', tableSelector);
        }
        if (commonFields_PD.tableSetting == "table2") {
            var tbl2Hdr3Vlu = commonFields_PD.headerText3Value;
            if (tieredType == "fixed") {
                tbl2Hdr3Vlu = tbl2Hdr3Vlu + " Amount";
            }
            else if (tieredType == "percentage") {
                tbl2Hdr3Vlu = tbl2Hdr3Vlu + " %";
            }
            TableHeadHtml('<div id="tieres" class="table-second"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th><th class="custom-block3 heading">' + tbl2Hdr3Vlu + '</th></tr></thead><tbody id="table-2-data"></tbody></table></div>', tableSelector);
        }

        if (commonFields_PD.tableSetting == "table3") {
            TableHeadHtml('<div id="tieres" class="table-third"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th><th class="custom-block3 heading">' + commonFields_PD.headerText3Value + '</th></tr></thead><tbody id="table-3-data"></tbody></table></div>', tableSelector);
        }

        if (commonFields_PD.tableSetting == "table4") {
            TableHeadHtml('<div id="tieres" class="table-fourth"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th></tr></thead><tbody id="table-4-data"></tbody></table></div>', tableSelector);
        }

        if (commonFields_PD.tableSetting == "table5") {
            var tbl5Hdr4Vlu = commonFields_PD.headerText4Value;
            if (tieredType == "fixed") {
                tbl5Hdr4Vlu = tbl5Hdr4Vlu + " Amount";
            }
            else if (tieredType == "percentage") {
                tbl5Hdr4Vlu = tbl5Hdr4Vlu + " %";
            }
            TableHeadHtml('<div id="tieres" class="table-fifth"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th><th class="custom-block3 heading">' + commonFields_PD.headerText3Value + '</th><th class="custom-block4 heading">' + tbl5Hdr4Vlu + '</th></tr></thead><tbody id="table-5-data"></tbody></table></div>', tableSelector);
        }

        if (commonFields_PD.tableSetting == "table6") {
            var tbl6Hdr3Vlu = commonFields_PD.headerText3Value;
            if (tieredType == "fixed") {
                tbl6Hdr3Vlu = tbl6Hdr3Vlu + " Amount";
            }
            else if (tieredType == "percentage") {
                tbl6Hdr3Vlu = tbl6Hdr3Vlu + " %";
            }
            TableHeadHtml('<div id="tieres" class="table-sixth"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + commonFields_PD.headerText2Value + '</th><th class="custom-block3 heading">' + tbl6Hdr3Vlu + '</th></tr></thead><tbody id="table-6-data"></tbody></table></div>', tableSelector);
        }
        if (commonFields_PD.tableSetting == "table7") {
            var tbl2Hdr3Vlu = commonFields_PD.headerText3Value;
            if (tieredType == "fixed") {
                tbl2Hdr3Vlu = tbl2Hdr3Vlu + " Amount";
            }
            else if (tieredType == "percentage") {
                tbl2Hdr3Vlu = tbl2Hdr3Vlu + " %";
            }
            TableHeadHtml('<div id="tieres" class="table-seventh"><table><thead><tr><th class="custom-block1 heading">' + commonFields_PD.headerText1Value + '</th><th class="custom-block2 heading">' + tbl2Hdr3Vlu + '</th></tr></thead><tbody id="table-7-data"></tbody></table></div>', tableSelector);
        }
    }
    
    var WriteTableFormatRows = function (tieredSplit_, selectedVariant_, variant_price) {
        var tieredType = tieredSplit_[0].trim(), originalPrice_ = commonFields_PD.variantsPriceArray_PD[selectedVariant_]; originalPrice_ = originalPrice_ / 100;

        for (i = 6; i < tieredSplit_.length; i++) {
            var isBreakLoop = false, tieredRange_ = tieredSplit_[i].split("=")[0], tieredOff = Number(tieredSplit_[i].split("=")[1]);
            var tieredMin_ = parseInt(tieredRange_.split("-")[0]), tieredMax_ = tieredRange_.split("-")[1], discountedPrice = 0;

            if (tieredMax_ != "max") {
                tieredMax_ = parseInt(tieredRange_.split("-")[1]);
            }
            else {
                tieredMax_ = "+";
            }

            if (tieredType == "percentage") {
                discountedPrice = Number(originalPrice_.toFixed(2));
                var p = parseFloat(tieredOff) / 100, originalPriceCut_ = Number(parseFloat(p * discountedPrice).toFixed(2));
                discountedPrice = discountedPrice - originalPriceCut_;
                if (discountedPrice <= 0) {
                    discountedPrice = 0;
                    tieredOff = "100%";
                    isBreakLoop = true;
                    tieredMax_ = "+";
                }
                else {
                    discountedPrice = discountedPrice.toFixed(2);
                    tieredOff = tieredOff + "%";
                }
            }
            else if (tieredType == "fixed_price") {
                //HERE
                const correct_tieredOff = localStorage.getItem('VAT') === 'Include' ? tieredOff * 1.2 : tieredOff;
                discountedPrice = correct_tieredOff.toFixed(2);
                tieredOff = correct_tieredOff + globalFields.currencySymbol;
            }
            else {
                discountedPrice = Number((originalPrice_ - tieredOff).toFixed(2));
                const correct_discountedPrice = localStorage.getItem('VAT') === 'Include' ? discountedPrice * 1.2 : discountedPrice;
                discountedPrice = correct_discountedPrice;
                if (discountedPrice <= 0) {
                    discountedPrice = 0;
                    tieredOff = originalPrice_ + globalFields.currencySymbol;
                    isBreakLoop = true;
                    tieredMax_ = "+";
                }
                else {
                    discountedPrice = discountedPrice.toFixed(2);
                    tieredOff = tieredOff + globalFields.currencySymbol;
                }
            }
            
            if (!document.querySelector('.multi-buy-' + i)) {
                jQuery('.variant-tier-heading').after('<th class="multi-buy-' + i + '">Multi Buy</th>')
            }
            TableFormatRowSingle(tieredMin_, tieredMax_, discountedPrice, variant_price);

            if (isBreakLoop) { break; }
        }
    }

    var WriteTableRows = function (tieredSplit_, selectedVariant_) {
        var tieredType = tieredSplit_[0].trim(), originalPrice_ = commonFields_PD.variantsPriceArray_PD[selectedVariant_]; originalPrice_ = originalPrice_ / 100;

        for (i = 6; i < tieredSplit_.length; i++) {
            var isBreakLoop = false, tieredRange_ = tieredSplit_[i].split("=")[0], tieredOff = Number(tieredSplit_[i].split("=")[1]);
            var tieredMin_ = parseInt(tieredRange_.split("-")[0]), tieredMax_ = tieredRange_.split("-")[1], discountedPrice = 0;

            if (tieredMax_ != "max") {
                tieredMax_ = parseInt(tieredRange_.split("-")[1]);
            }
            else {
                tieredMax_ = "+";
            }

            if (tieredType == "percentage") {
                discountedPrice = Number(originalPrice_.toFixed(2));
                var p = parseFloat(tieredOff) / 100, originalPriceCut_ = Number(parseFloat(p * discountedPrice).toFixed(2));
                discountedPrice = discountedPrice - originalPriceCut_;
                if (discountedPrice <= 0) {
                    discountedPrice = 0;
                    tieredOff = "100%";
                    isBreakLoop = true;
                    tieredMax_ = "+";
                }
                else {
                    discountedPrice = discountedPrice.toFixed(2);
                    tieredOff = tieredOff + "%";
                }
            }
            else if (tieredType == "fixed_price") {
                const correct_tieredOff = localStorage.getItem('VAT') === 'Include' ? tieredOff : tieredOff / 1.2;
                discountedPrice = correct_tieredOff.toFixed(2);
                tieredOff = correct_tieredOff + globalFields.currencySymbol;
            }
            else {
                discountedPrice = Number((originalPrice_ - tieredOff).toFixed(2));
                const correct_discountedPrice = localStorage.getItem('VAT') === 'Include' ? discountedPrice : discountedPrice / 1.2;
                discountedPrice = correct_discountedPrice;
                if (discountedPrice <= 0) {
                    discountedPrice = 0;
                    tieredOff = originalPrice_ + globalFields.currencySymbol;
                    isBreakLoop = true;
                    tieredMax_ = "+";
                }
                else {
                    discountedPrice = discountedPrice.toFixed(2);
                    tieredOff = tieredOff + globalFields.currencySymbol;
                }
            }
            console.log(discountedPrice)

            TableRowSingle(tieredMin_, tieredMax_, discountedPrice, tieredOff);

            if (isBreakLoop) { break; }
        }
    }

    var TableRowHtml = function (contentHtml, tableSelector) {
        jQuery(tableSelector).append(contentHtml);
    }

    var TableFormatRowSingle = function (tieredMin_, tieredMax_, discountedPrice, variant_price) {
        var plusSign = tieredMin_ == tieredMax_ ? '' : '+', buyText = 'Buy ';
        var priceHtml = '<span class="money" data-currency-' + globalFields.currency.toLowerCase() + '="' + discountedPrice + globalFields.currencySymbol + '" data-currency="' + globalFields.currency + '">' + globalFields.formatMoney(discountedPrice, globalFields.amount) + '</span>';
        var quantity_selector = variant_price[0].parentNode.querySelector('.quantity-selector-td');

        jQuery(quantity_selector).before('<td class="custom-block-sp bdcontent"><span>' + tieredMin_ + plusSign + '</span>' + priceHtml + '</td>');
        
        const extraPriceContainers = document.querySelectorAll('.extra-price');
        const variantID1 = variant_price.attr('data-id');

        for (let i = 0; i < extraPriceContainers.length; i++) {
            const extraPriceContainer = extraPriceContainers[i];
            var variantID2 = extraPriceContainer.getAttribute('data-variant-price');
            if (variantID1 == variantID2){
                extraPriceContainer.innerHTML += '<div><span class="extra-price--name">' + tieredMin_ + plusSign + '</span><span class="extra-price--price">' + priceHtml + '</span></div>';
            }
        }
    }

    var TableRowSingle = function (tieredMin_, tieredMax_, discountedPrice, tieredOff) {
        var plusSign = tieredMin_ == tieredMax_ ? '' : '+', buyText = 'Buy ';
        var priceHtml = '<span class="money" data-currency-' + globalFields.currency.toLowerCase() + '="' + discountedPrice + globalFields.currencySymbol + '" data-currency="' + globalFields.currency + '">' + globalFields.formatMoney(discountedPrice, globalFields.amount) + '</span>';
        if (commonFields_PD.tableSetting == "table1") {
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + tieredMin_ + plusSign + '</td><td class="custom-block2 bdcontent">' + priceHtml + '</td></tr>', '#table-1-data');
        }

        if (commonFields_PD.tableSetting == "table2") {
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + buyText + tieredMin_ + plusSign + '</td><td class="custom-block2 bdcontent">' + priceHtml + '</td><td class="custom-block3 bdcontent">' + tieredOff + '</td></tr>', '#table-2-data');
        }

        if (commonFields_PD.tableSetting == "table3") {
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + tieredMin_ + '</td><td class="custom-block2 bdcontent">' + tieredMax_ + '</td><td class="custom-block3 bdcontent">' + priceHtml + '</td></tr>', '#table-3-data');
        }

        if (commonFields_PD.tableSetting == "table4") {
            var quantityTextTable4 = tieredMin_ + "-" + tieredMax_;
            if (tieredMax_ == "+") {
                quantityTextTable4 = tieredMin_ + "+";
            }
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + buyText + quantityTextTable4 + '</td><td class="custom-block2 bdcontent">' + priceHtml + '</td></tr>', '#table-4-data');
        }

        if (commonFields_PD.tableSetting == "table5") {
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + tieredMin_ + '</td><td class="custom-block2 bdcontent">' + tieredMax_ + '</td><td class="custom-block3 bdcontent">' + priceHtml + '</td><td class="custom-block4 bdcontent">' + tieredOff + '</td></tr>', '#table-5-data');
        }

        if (commonFields_PD.tableSetting == "table6") {
            var quantityTextTable6 = tieredMin_ + "-" + tieredMax_;
            if (tieredMax_ == "+") {
                quantityTextTable6 = tieredMin_ + "+";
            }
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + buyText + quantityTextTable6 + '</td><td class="custom-block2 bdcontent">' + priceHtml + '</td><td class="custom-block3 bdcontent">' + tieredOff + '</td></tr>', '#table-6-data');
        }
        if (commonFields_PD.tableSetting == "table7") {
            var quantityTextTable6 = tieredMin_ + "-" + tieredMax_;
            if (tieredMax_ == "+") {
                quantityTextTable6 = tieredMin_ + "+";
            }
            TableRowHtml('<tr><td class="custom-block1 bdcontent">' + buyText + quantityTextTable6 + '</td><td class="custom-block3 bdcontent">' + tieredOff + '</td></tr>', '#table-7-data');
        }
    }

}

var commonFields_PD = new VGTierApp.PDPage.Global(), displayTiers = new VGTierApp.PDPage.DisplayTiers();
displayTiers.DisplayTiersFn(); displayTiers.OnVariantChange();