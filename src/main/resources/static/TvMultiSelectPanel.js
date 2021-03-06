/***
 * Plugin TVMultiSelectPanel was developed by ThanhVan at 15/11/2018
 * ver 1.0.1
 */
(function ($) {
    $.fn.panelMultiSelect = function (options) {
        console.log('intitalizing ThanhVan multi select panel:');
        let elementReference = this;
        let currentRowMapList = [];
        let rowIdOfIndexButtonList = [];
        let selectedMap = new Map();
        let buttonElementList = [];
        let checkboxElementList = [];
        let selectedCountElement;
        let buttonElementListString = '';
        let selectedButtonElementListString = '';
        let searching = false;
        const ELEMENT_ID = $(elementReference).attr('id');
        const CHECKBOX_WRAPPER_ID = ELEMENT_ID + '_checkbox_wrapper';
        const BUTTON_WRAPPER_ID = ELEMENT_ID + '_button_wrapper';
        const SHOW_ONLY_SELECTED_CB_ID = ELEMENT_ID + '_show_only_selected';
        const SELECT_ALL_BTN_ID = ELEMENT_ID + '_select_all_btn';
        const UN_SELECT_ALL_BTN_ID = ELEMENT_ID + '_un_select_all_btn';
        const SELECT_PANEL_WRAPPER_ID = ELEMENT_ID + '_panel_wrapper';
        const PREVIEW_DIV_ID = ELEMENT_ID + '_preview_div';
        const SEARCH_DIV_ID = ELEMENT_ID + '_search_div';
        const SEARCH_DIV_CONTENT = ELEMENT_ID + '_search_div_content';
        const EXIST_SEARCH_BTN_ID = ELEMENT_ID + '_exist_search_btn';
        const SEARCH_INPUT_ID = ELEMENT_ID + '_search_input';
        const SEARCH_BTN_ID = ELEMENT_ID + '_search_btn';
        const SEARCH_CLEAR_ID = ELEMENT_ID + '_clear_search';
        const MULTI_SELECT_MODE_ID = ELEMENT_ID + '_multi_select';
        const PREVIEW_MODE_ID = ELEMENT_ID + '_preview_mode';
        const SEARCH_MODE_ID = ELEMENT_ID + '_search_mode';
        const GROUP_MODE_ID = ELEMENT_ID + '_group_mode';
        const HEADER_AND_FOOTER_TOTAL_HEIGHT = 80;

        var defaults = {
            keyAttributeName: 'key',
            valueAttributeName: 'value',
            dataSource: [],
            customValueCallBackFunc: null,
            customKeyCallBackFunc: null,
            elementClassName: 'tv-select-element',
            elementShowClassName: 'tv-select-element_show',
            selectPanelContentWrapperClassName: 'tv-select-panel-content-wrapper',
            selectedElementCss: {color: 'white', background: '#6F9301', border: ''},
            notSelectedElementCss: {color: 'black', background: 'white', border: ''},
            selectedCountColor: '#608001',
            selectedElementStyle: 'color: white; background: #6F9301; border: ',
            notSelectedElementStyle: 'color: black; background: white; border: ',
            checkboxClassName: 'tv-check-box-element',
            checkboxDivWrapperClassName: 'tv-check-box-wrapper',
            checkboxDivWrapperWidth: '25',
            tvSelectFooterClassName: 'tv-select-footer',
            tvSelectHeaderClassName: 'tv-select-header'
        };

        var settings = $.extend(defaults, options);

        const COUNT_TOTAL_ELEMENT = settings.dataSource.length;

        function isNotExistElement(element) {
            return typeof element === 'undefined' || element === null
        }

        // function to custom title and value when render to view element
        function prepareElementData(elementData, attributeName, callbackFunc) {
            const attributeValue = elementData[attributeName];
            if (isNotExistElement(callbackFunc)) {
                return attributeValue;
            } //else
            return callbackFunc(attributeValue);
        }


        function renderUiFromData() {
            const keyAttributeName = settings.keyAttributeName;
            const valueAttributeName = settings.valueAttributeName;
            const dataSource = settings.dataSource;
            const halfBeforeStringBtn_1 = '<button style="';
            const halfBeforeStringBtn_2 = '" class="' + settings.elementClassName;
            const notSelectedElementStyle = settings.notSelectedElementStyle;
            const selectedElementStyle = settings.selectedElementStyle;
            $(dataSource).each(function () {
                const keyData = prepareElementData(this, keyAttributeName, settings.customKeyCallBackFunc);
                const valueData = prepareElementData(this, valueAttributeName, settings.customValueCallBackFunc);
                buttonElementListString += halfBeforeStringBtn_1 + notSelectedElementStyle + halfBeforeStringBtn_2 + '" data-key ="' +
                    keyData + '">' + valueData + '</button>';

                selectedButtonElementListString += halfBeforeStringBtn_1 + selectedElementStyle + halfBeforeStringBtn_2 + '" data-key ="' +
                    keyData + '">' + valueData + '</button>';
            });

            let buttonWrapperWidth = $(elementReference).width() - settings.checkboxDivWrapperWidth - 25;


            const elementWidth = $(elementReference).width();
            let contentHeight = $(elementReference).height() - HEADER_AND_FOOTER_TOTAL_HEIGHT;
            if (elementWidth < 470) {
                contentHeight -= 25;
            }
            if (elementWidth < 460) {
                contentHeight -= 25;
            }
            if (elementWidth < 325) {
                contentHeight -= 25;
            }
            const headerMultiSelectString = '<div class="' + settings.tvSelectHeaderClassName + '">' +
                '<div class="align-height-center-left" style="float: left"><span style="display: flex">' +
                '<div><span class="btn-xs-custom" id="' + SELECT_ALL_BTN_ID +
                '">Select</span><span class="blue-span">&nbsp;/</span> <span class="btn-xs-custom" id="' +
                UN_SELECT_ALL_BTN_ID + '">UnSelect All</span> </input>' +
                '</div></div>' +
                '<div style="float: right" class="align-height-center-right">' +
                '<span class="input-group search-input-group"><input class="input-search" id="' + SEARCH_INPUT_ID +
                '" placeholder="Typing keyword..." type="text"/><span id="' + SEARCH_CLEAR_ID +
                '" class="clear-search">x</span><span id="' + SEARCH_BTN_ID +
                '" class="btn input-group-addon fa fa-search search-icon"></span></span>' +
                '</div><div class="clearfix"></div></div>';

            const footerMultiSelectString = '<div class="' + settings.tvSelectFooterClassName + '">' +
                '<div style="float: left"  class="footer-height-center"><span class="active-mode hide" id="' +
                SEARCH_MODE_ID + '">Search Mode</span><div id="' + GROUP_MODE_ID +
                '">&nbsp;<span class="active-mode" id="' + MULTI_SELECT_MODE_ID + '">Multi Select</span>&nbsp;<span class="blue-mode">|' +
                '</span>&nbsp;<span class="blue-mode" id="' +
                PREVIEW_MODE_ID + '">' + 'Preview Selected Mode</span></div></div>' +
                '<div style="float: right" class="footer-height-center">' +
                '<span>Selected: <span style="color: ' + settings.selectedCountColor +
                '" class="number-content" id="selectedCountSpan">0' +
                '</span><span class="space">&nbsp;</span><span class="blue-span">/</span><span class="space">&nbsp;</span><span class="number-content blue-smooth">' +
                formatNumberString(COUNT_TOTAL_ELEMENT.toString()) + '</span></span><span class="clearfix"></span></div>' +
                '</div></div></div>';

            const contentMultiSelectString = '<div style="height: ' + contentHeight + 'px; width: ' +
                ($(elementReference).width() - 5) + 'px" class="' + settings.selectPanelContentWrapperClassName +
                '" id="' + settings.selectPanelContentWrapperClassName + '"><div id="' + CHECKBOX_WRAPPER_ID +
                '" class="' + settings.checkboxDivWrapperClassName +
                '" style="min-height:' + ($(elementReference).height() - 10) + 'px"></div><div id="' + BUTTON_WRAPPER_ID +
                '" style="float:left;width: ' + buttonWrapperWidth +
                'px;">' + buttonElementListString + '</div><div class="clearfix"></div></div>';

            $(elementReference).append('<div id="' + SELECT_PANEL_WRAPPER_ID + '">' + headerMultiSelectString +
                contentMultiSelectString + footerMultiSelectString + '</div>');
            selectedCountElement = $('#selectedCountSpan');
        }

        function setupCurrentRowMapList() {
            let buttonIndexList = new Array();
            let currentRowIndex = 0;
            let currentOffsetTop;
            let buttonList = $(elementReference).find('button');
            currentOffsetTop = getOffsetTop(buttonList[0]);
            $(buttonList).each(function (index) {
                // this.rowIndex = currentRowIndex;
                this.key = $(this).data('key');
                this.value = $(this).text();
                this.index = index;
                this.checked = false;
                buttonElementList.push(this);
                const buttonOffsetTop = getOffsetTop(this);
                if (buttonOffsetTop === currentOffsetTop) {
                    buttonIndexList.push(index);
                    rowIdOfIndexButtonList.push(currentRowIndex);
                } else {
                    currentRowMapList.push({
                        selectedCount: 0,
                        totalCount: buttonIndexList.length,
                        listElementInRow: buttonIndexList
                    });
                    // this.rowIndex = ++currentRowIndex;
                    rowIdOfIndexButtonList.push(++currentRowIndex);
                    currentOffsetTop = buttonOffsetTop;
                    buttonIndexList = [];
                    buttonIndexList.push(index);
                }
            });
            currentRowMapList.push({
                selectedCount: 0,
                totalCount: buttonIndexList.length,
                listElementInRow: buttonIndexList
            });
        }

        function setupCheckboxRowList() {
            const rowSize = currentRowMapList.length;
            let checkboxElementListString = '';
            const checkboxHeight = $(buttonElementList[0]).outerHeight();

            for (let index = 0; index < rowSize; index++) {
                checkboxElementListString += '<div class="' + settings.checkboxClassName +
                    '" style="height: ' + checkboxHeight + 'px"><input type="checkbox" data-index ="' +
                    index + '"/></div>';
            }
            $(elementReference).find('#' + CHECKBOX_WRAPPER_ID).append(checkboxElementListString);
        }

        function setupSelectedEventOfElement() {
            $(buttonElementList).each(function () {
                $(this).on('click', function () {
                    if (this.checked) {
                        setupWhenNoSelectButton(this);
                        return;
                    }
                    //else
                    setupWhenSelectButton(this);
                })
            });
        }

        function setupSelectedButton(buttonElement) {
            $(buttonElement).css(settings.selectedElementCss);
            selectedMap.set(buttonElement.index, {key: buttonElement.key, value: buttonElement.value});
            buttonElement.checked = true;
        }

        function setupWhenSelectButton(buttonElement) {
            setupSelectedButton(buttonElement);
            const rowIndex = rowIdOfIndexButtonList[buttonElement.index];
            const currentRow = currentRowMapList[rowIndex];
            if (++currentRow.selectedCount === currentRow.totalCount) {
                $(checkboxElementList[rowIndex]).prop('checked', 'checked');
            }
            setTextSelectedCount();
        }

        function setupNoSelectButton(buttonElement) {
            $(buttonElement).css(settings.notSelectedElementCss);
            selectedMap.delete(buttonElement.index);
            buttonElement.checked = false;
        }

        function setupWhenNoSelectButton(buttonElement) {
            setupNoSelectButton(buttonElement);
            const rowIndex = rowIdOfIndexButtonList[buttonElement.index];
            const currentRow = currentRowMapList[rowIndex];
            if (currentRow.selectedCount-- === currentRow.totalCount) {
                $(checkboxElementList[rowIndex]).prop('checked', '');
            }
            setTextSelectedCount();
        }

        function setupCheckboxEvent() {
            $('#' + CHECKBOX_WRAPPER_ID).find('input[type="checkbox"]').each(function () {
                $(this).on('change', function () {
                    const isChecked = this.checked;
                    const currentRow = currentRowMapList[$(this).data('index')];
                    const listIndexButton = currentRow.listElementInRow;
                    if (isChecked) {
                        $(listIndexButton).each(function () {
                            setupSelectedButton(buttonElementList[this]);
                        });
                        currentRow.selectedCount = currentRow.totalCount;
                    } else {
                        $(listIndexButton).each(function () {
                            setupNoSelectButton(buttonElementList[this]);
                        });
                        currentRow.selectedCount = 0;
                    }
                    setTextSelectedCount();
                });
                checkboxElementList.push(this);
            });
        }

        function getOffsetTop(element) {
            return $(element).offset().top;
        }

        function formatNumberString(numberStr) {
            return numberStr.replace(/(?=(?:\d{3})+$)(?!^)/g, ',');
        }

        function setTextSelectedCount() {
            $(selectedCountElement).text(formatNumberString(selectedMap.size.toString()));
        }

        function setupShowMultiSelectMode() {
            $('#' + MULTI_SELECT_MODE_ID).on('click', function () {
                let panelContent = $('#' + settings.selectPanelContentWrapperClassName);
                let panelContentChildren = panelContent.children();
                $('#' + SELECT_ALL_BTN_ID).css("pointer-events", "auto");
                $('#' + UN_SELECT_ALL_BTN_ID).css("pointer-events", "auto");
                $('#' + SEARCH_INPUT_ID).prop('disabled', false);
                $('#' + SEARCH_BTN_ID).css("pointer-events", "auto");
                $('#' + MULTI_SELECT_MODE_ID).attr('class', 'active-mode');
                $('#' + PREVIEW_MODE_ID).attr('class', 'blue-mode');
                $('#' + PREVIEW_DIV_ID).remove();
                $(panelContentChildren).each(function () {
                    $(this).show();
                });
            });

        }

        function setupShowPreviewMode() {
            $('#' + PREVIEW_MODE_ID).on('click', function () {
                let panelContent = $('#' + settings.selectPanelContentWrapperClassName);
                let panelContentChildren = panelContent.children();
                let previewDivString;
                let buttonListString = '';
                $('#' + SELECT_ALL_BTN_ID).css('pointer-events', 'none');
                $('#' + UN_SELECT_ALL_BTN_ID).css('pointer-events', 'none');
                $('#' + SEARCH_BTN_ID).css('pointer-events', 'none');
                $('#' + SEARCH_INPUT_ID).prop('disabled', 'true');
                $('#' + MULTI_SELECT_MODE_ID).attr('class', 'blue-mode');
                $('#' + PREVIEW_MODE_ID).attr('class', 'active-mode');

                const halfBeforeStringBtn = '<button class="' + settings.elementShowClassName;

                function callback(value) {
                    buttonListString += halfBeforeStringBtn + '">' + (value.value) + '</buton>';
                }

                selectedMap.forEach(callback);
                $(panelContentChildren).each(function () {
                    $(this).hide();
                });
                if (selectedMap.size !== 0) {
                    previewDivString = '<div class="previewDiv" id="' +
                        PREVIEW_DIV_ID + '">' + buttonListString + '</div>';
                } else {
                    previewDivString = '<div class="previewDiv loading-div" id="' +
                        PREVIEW_DIV_ID + '">' + 'No selected data to preview...' + '</div>';
                }
                $(panelContent).prepend(previewDivString);
            })
        }

        function setupSelectAllBtn() {
            let selectAllBtn = $('#' + SELECT_ALL_BTN_ID);
            let unSelectAllBtn = $('#' + UN_SELECT_ALL_BTN_ID);
            $(selectAllBtn).on('click', function () {
                if (selectedMap.size === buttonElementList.length) {
                    return;
                }
                buttonElementList.length = 0;
                selectedMap.clear();
                $('#' + BUTTON_WRAPPER_ID).html(selectedButtonElementListString);
                let buttonList = $(elementReference).find('button');
                $(buttonList).each(function (index) {
                    this.checked = true;
                    this.key = $(this).data('key');
                    this.value = $(this).text();
                    this.index = index;
                    buttonElementList.push(this);
                    selectedMap.set(index, {key: this.key, value: this.value});
                });

                $(currentRowMapList).each(function () {
                    this.selectedCount = this.totalCount;
                });
                $('#' + CHECKBOX_WRAPPER_ID).find('input[type="checkbox"]').each(function () {
                    $(this).prop('checked', 'checked');
                });
                setupSelectedEventOfElement();
                setTextSelectedCount();
            });
        }

        function setupUnSelectAllBtn() {
            let selectAllBtn = $('#' + SELECT_ALL_BTN_ID);
            let unSelectAllBtn = $('#' + UN_SELECT_ALL_BTN_ID);
            $(unSelectAllBtn).on('click', function () {
                if (selectedMap.size === 0) {
                    return;
                }
                buttonElementList.length = 0;
                selectedMap.clear();
                $('#' + BUTTON_WRAPPER_ID).html(buttonElementListString);
                let buttonList = $(elementReference).find('button');
                $(buttonList).each(function (index) {
                    this.checked = false;
                    this.key = $(this).data('key');
                    this.value = $(this).text();
                    this.index = index;
                    buttonElementList.push(this);
                });
                $(currentRowMapList).each(function () {
                    this.selectedCount = 0;
                });
                $('#' + CHECKBOX_WRAPPER_ID).find('input[type="checkbox"]').each(function () {
                    $(this).prop('checked', '');
                });

                setupSelectedEventOfElement();
                setTextSelectedCount();
            });

        }
        
        function checkContaninString(one, two) {
            return one.toUpperCase().indexOf(two.toUpperCase()) !== -1;
        }

        function setupEventSearching() {
            const halfBeforeStringBtn_1 = '<button style="';
            const halfBeforeStringBtn_2 = '" class="' + settings.elementClassName;
            const notSelectedElementStyle = settings.notSelectedElementStyle;
            const selectedElementStyle = settings.selectedElementStyle;
            let panelContent = $('#' + settings.selectPanelContentWrapperClassName);
            const searchDiv = $('#' + SEARCH_DIV_ID);
            let panelContentChildren = panelContent.children();
            let searchInput = $('#' + SEARCH_INPUT_ID);

            function makeButtonString(isSelected, index, value) {
                return halfBeforeStringBtn_1 + (isSelected ? selectedElementStyle : notSelectedElementStyle) +
                    halfBeforeStringBtn_2 + '"data-selected ="' + (isSelected ? 1 : 0) + '"  data-index ="' + index + '">' + value + '</button>';
            }

            $('#' + SELECT_ALL_BTN_ID).css("pointer-events", "none");
            $('#' + UN_SELECT_ALL_BTN_ID).css("pointer-events", "none");
            $('#' + SHOW_ONLY_SELECTED_CB_ID).prop('disabled', true);
            $(panelContentChildren).each(function () {
                $(this).hide();
            });
            document.getElementById(settings.selectPanelContentWrapperClassName).scrollTop = 0;
            const searchTxt = $(searchInput).val().trim();
            let buttonListString = '';
            let countResult = 0;
            if (searchTxt.length === 0) {
                $(searchInput).addClass('error-wrapper');
                buttonListString = '<span style="margin-left: 5px">Typing at least one character, please...</span>';
                $(searchInput).focus();
            } else {
                $(searchInput).removeClass('error-wrapper');
                $(buttonElementList).each(function () {
                    if (checkContaninString(this.value, searchTxt)) {
                        countResult++;
                        buttonListString += makeButtonString(this.checked, this.index, this.value);
                    }
                });
            }

            let searchContent = '<div class="search-header"><div class="search-header-right"><button id="' +
                EXIST_SEARCH_BTN_ID + '" class="btn-xs-custom">Exit Search Mode</button></div><div class="search-header-left">' +
                (searchTxt.length !== 0 ? '- ' + '<span style="font-weight: bold">' + countResult + '</span>&nbsp;results for keyword "' +
                    searchTxt + '"' : '') + '</div><div class="clearfix"></div></div>' +
                '<div id="' + SEARCH_DIV_CONTENT + '">' + buttonListString + '</div>';

            if (!searching) {
                searching = true;
                $('#' + SEARCH_MODE_ID).removeClass('hide');
                $('#' + GROUP_MODE_ID).hide();
                $(panelContent).prepend('<div class="search-div" id="' + SEARCH_DIV_ID + '">' + searchContent + '</div>');
            } else {
                $(searchDiv).html(searchContent);
                $(searchDiv).show();
            }
            $('#' + EXIST_SEARCH_BTN_ID).on('click', function () {
                searching = false;
                $('#' + SEARCH_MODE_ID).addClass('hide');
                $('#' + GROUP_MODE_ID).show();
                $('#' + SEARCH_DIV_ID).remove();
                $(panelContentChildren).each(function () {
                    $(this).show();
                });
                $('#' + SELECT_ALL_BTN_ID).css("pointer-events", "auto");
                $('#' + UN_SELECT_ALL_BTN_ID).css("pointer-events", "auto");
                $('#' + SHOW_ONLY_SELECTED_CB_ID).prop('disabled', false);
                clearSearch();
            });

            $('#' + SEARCH_DIV_CONTENT).children().each(function () {
                $(this).on('click', function () {
                    let cssString = $(this).data('selected') == '1' ? settings.notSelectedElementCss : settings.selectedElementCss;
                    let data_selected = $(this).data('selected') == '1' ? '0' : '1';
                    $(this).css(cssString);
                    $(this).data('selected', data_selected);
                    $(buttonElementList)[$(this).data('index')].click();
                })
            });
        }

        function setupSearch() {
            const searchInput = $('#' + SEARCH_INPUT_ID);
            $('#' + SEARCH_BTN_ID).on('click', function () {
                setupEventSearching();
            });

            $(searchInput).on('keydown', function (e) {
                if (e.switch === 13 || e.keyCode === 13) {
                    setupEventSearching();
                }
            });
            $(searchInput).on('keyup', function () {
                const searchClose = $('#' + SEARCH_CLEAR_ID);
                if ($(this).val().length !== 0) {
                    $(searchClose).show();
                } else {
                    $(searchClose).hide();
                }
            });
            $('#' + SEARCH_CLEAR_ID).on('click', function () {
                clearSearch();
            });
        }

        function clearSearch() {
            const searchInput = $('#' + SEARCH_INPUT_ID);
            $(searchInput).val('');
            $(searchInput).focus();
            $('#' + SEARCH_CLEAR_ID).hide();
            $(searchInput).removeClass('error-wrapper');
        }

        function showLoading() {
            $(elementReference).append('<div class="loading-div" id="' + ELEMENT_ID +
                '_loading">Initializing, please wait...</div>');
        }

        function removeLoading() {
            $('#' + ELEMENT_ID + '_loading').remove();
        }

        function init() {
            showLoading();
            setTimeout(function () {
                let start = new Date().getTime();
                renderUiFromData();
                setupCurrentRowMapList();
                setupCheckboxRowList();
                setupSelectedEventOfElement();
                setupCheckboxEvent();
                setupShowMultiSelectMode();
                setupShowPreviewMode();
                setupSelectAllBtn();
                setupUnSelectAllBtn();
                removeLoading();
                setupSearch();
                let end = new Date().getTime();
                console.log(end - start + 'ms');
            }, 0);

        }

        var getSelectedResult = function () {
            let resultString = '';
            for (let selectedKey of selectedMap.keys()) {
                resultString += selectedKey + ',';
            }
            return resultString;
        };

        init();

        return {
            getSelectedResult: getSelectedResult
        }
    }
})(jQuery);