/****************************************************************************
    fcoo-widget.js,

    (c) 2024, FCOO

    https://github.com/FCOO/fcoo-widget
    https://github.com/FCOO

****************************************************************************/

(function ($, window, document, undefined) {
    "use strict";

    //Create fcoo-namespace
    let ns = window.fcoo = window.fcoo || {},
        nsWidget = ns.widget = ns.widget || {};


    /********************************************************
    Common methods
    ********************************************************/
    const setVar = ns.setVar = ($elem, id, value) => {
        $elem[0].style.setProperty(id, value);
        return $elem;
    };


    $.fn.extend({
        setVar: function(id, value){
            return this.each(function() {
                setVar($(this), id, value);
            });
        }
    });



    /********************************************************
    Widget(options)
    options = {
        header          : {icon, text}
        fixedHeader     : {icon, text}
        envBackground   : false or {partID: partOptions} where partId = 'space', 'cloud', 'sky', 'wave', 'ice', 'snow', 'sea', 'land', or 'seabed'. See src/environmental-background.js for details
        direction       : false, true or 'from'. If not false adds a direction-circle and arrow
        noData          : false, true or content to be shown when no data is available. true => xx-large '?'
        content         : CONTENTPART or []CONTENTPART, CONTENTPART = string, function($container) or {content, size}

        icons: ICON or []ICON, ICON={icon:string, pos:'topleft', 'topcenter', etc, onClick: function}
    }
    ********************************************************/

    const defaultModalOptions = {
        smallButtons  : true,
        closeButton   : false,
//        small         : true,
//        useTouchSize  : true,
        noCloseIconOnHeader: true

//alwaysMaxHeight: true, Måske hvis der er en fixed height på outer container
    },

    defaultMinimizedOptions = {
        content     : false,
        showHeader  : true,
        fixed       : true,
        footer      : true
    };

    /********************************************************
    Widget( options ){
    ********************************************************/
    function Widget( options ){
        this.options = $.extend(true, {
            //Default options
            noDataFontSize: 'xxl'

        }, options || {} );
    }

    // expose access to the constructor
    nsWidget.Widget = Widget;

    /********************************************************
    Standard content
    ********************************************************/
    const standardContent = {
        '_DIRECTION_' : function( $content, widgetOptions ){
            $content.append(
                $('<span/>')._bsAddHtml({
                    textClass: 'contains-direction',
                    vfFormat : 'direction',
                    vfValue  : 123,
                    vfOptions: {directionFrom: widgetOptions.dirFrom}
                }),
                '&nbsp;&nbsp;',
                $('<span/>')._bsAddHtml({
                    textClass: 'contains-direction',
                    vfFormat : 'direction_text',
                    vfValue  : 123,
                    vfOptions: {directionFrom: widgetOptions.dirFrom}
                })
            );
        },
    };


    //Extend the prototype
    nsWidget.Widget.prototype = {
        /*******************************************************
        createModalContent
        *******************************************************/
        _adjustOptions: function(options, isMinOrExt, defaultHeight = 300){
            function valueAsStr(value){
                return typeof value == 'string' ? value : value+'px';
            }

            options.scroll = options.scroll || false;

            if (options.noPadding){
                options.noVerticalPadding   = true;
                options.noHorizontalPadding = true;
            }

            options.fixedContent = options.fixedContent || options.fixed;
            delete options.fixed;

            if (options.fixedHeader){
                options.fixedContent = {
                    content     : $._bsAdjustIconAndText(options.fixedHeader),
                    innerHeight : '2em',
                    withBorder  : true,
                    centerMiddle: true
                };
                //options.fixedClassName = (options.fixedClassName || '') + 'fw-bold';
            }

            if (isMinOrExt){
                options.fixedContent  = options.hideFixed ? false : options.fixedContent || this.options.fixedContent;
                options.fixedContentOptions = options.fixedContentOptions || this.options.fixedContentOptions;

                options.footer = options.hideFooter ? false : options.footer || this.options.footer;

                //showHeader = true by default
                options.showHeader = options.showHeader || !options.hideHeader;
            }

            //Update options with id: true
            ['envBackground', 'noAnimation', 'noData', 'relativeFontSize'].forEach((id) => {
                options[id] = options[id] === true ? this.options[id] : options[id];
            }, this);

            //Update forced options = options that always take default value
            ['direction', 'noPadding', 'noVerticalPadding', 'noHorizontalPadding'].forEach((id) => {
                options[id] = options[id] === undefined ? this.options[id] : options[id];
            }, this);

            if (options.edge)
                options.widgetContent = true;

            if (options.envBackground || options.widgetContent)
                options.innerHeight = options.innerHeight || defaultHeight;

            //Adjust width and height
            if (isMinOrExt && (options.width === true) || ((options.width == undefined) && (options.innerWidth == undefined))){
                options.width      = this.options.width;
                options.innerWidth = this.options.innerWidth;
            }
            else {
                //Get and set width and innerWidth. Definition width = innerWidth + 2*border-width + 2*horizontal-padding (if padding) + 2*scrollbar-width (if scroll)
                let horizontalBorderAndPaddingAndScrollbar = '';
                if (options.scroll)
                    horizontalBorderAndPaddingAndScrollbar = 'var(--jsc-scroll-padding)';
                else
                    if (!options.noHorizontalPadding)
                        horizontalBorderAndPaddingAndScrollbar = 'var(--bs-modal-padding-x)';

                horizontalBorderAndPaddingAndScrollbar =
                    '(' +
                        '2 * var(--bs-modal-border-width)' +
                        (horizontalBorderAndPaddingAndScrollbar ? ' + 2 * ' + horizontalBorderAndPaddingAndScrollbar: '') +
                    ')';

                let setInnerWidth = false;
                if (options.width)
                    //Inner-width is given by width
                    setInnerWidth = true;
                else {
                    if (options.innerWidth)
                        options.width = 'calc('+valueAsStr(options.innerWidth) + ' + ' + horizontalBorderAndPaddingAndScrollbar + ')';
                    else {
                        options.width = 300;
                        setInnerWidth = true;
                    }
                }
                if (setInnerWidth)
                    options.innerWidth = 'calc('+valueAsStr(options.width) + ' - ' + horizontalBorderAndPaddingAndScrollbar + ')';
            }


            //Get and set innerHeight and innerMaxHeight
            let verticalPadding = options.noVerticalPadding ? '' : ' + 2 * var(--bs-modal-padding-y)';
            if (options.innerMaxHeight)
                options.innerMaxHeight = 'calc('+valueAsStr(options.innerMaxHeight) + verticalPadding + ')';

            //Allow options.height for minimized and extended options
            if (options.height && !options.innerHeight && isMinOrExt){
                options.innerHeight = options.height;
                delete options.height;
            }

            if (options.innerHeight)
                options.innerHeight = 'calc('+valueAsStr(options.innerHeight) + verticalPadding + ')';
        },


        create: function(){
            this.$container =
                $('<div/>')
                    .addClass('widget-container')
                    .addClass(this.options.containerClass || '');


            let opt = this.options;
            let modalOpt = this.modalOptions = $.extend(true, {},
                    defaultModalOptions, {
                        $container: this.$container,
                        header    : opt.header,
                        scroll    : opt.scroll,
                        footer    : opt.footer
                    },
                    opt.modalOptions || {} );

            if (modalOpt.minimized)
                modalOpt.minimized = $.extend(true, {}, defaultMinimizedOptions, modalOpt.minimized);

            //Adjust options, width and height for normal content
            this._adjustOptions(opt);
            modalOpt = $.extend(true, modalOpt, opt);

            //Adjust options, width and height for minimized content
            if (opt.minimized){
                this._adjustOptions(opt.minimized, true, '1.5em');
                modalOpt.minimized = $.extend(true, {}, opt.minimized);
                modalOpt.minimized.content = function($container){
                    this.createContent($container, 'minimized');
                }.bind(this);
            }

            modalOpt.content = this.createContent.bind(this);
            modalOpt.fixedContent = opt.fixedContent;

            if (opt.extended){
                this._adjustOptions(opt.extended, true, 400);
                modalOpt.extended = $.extend(true, {}, opt.extended);
                modalOpt.extended.content = function($container){
                    this.createContent($container, 'extended');
                }.bind(this);
            }

            this.modal = $.bsModal(modalOpt);
            return this.$container;
        },

        /*******************************************************
        createContent
        *******************************************************/
        createContent: function($modalContainer, optionsId){
            //*******************************************
            const createContentContainer = (className = 'show-for-data-available') => {
                return $('<div/>')
                    .addClass('content')
                    .addClass(className)
                    .appendTo($modalContainer);
            };
            //*******************************************
            this.$content = this.$content || [];

            let o = optionsId ? this.options[optionsId] : this.options,
                noAnimation = o.noAnimation,
                $content = this.$content[optionsId || 'normal'] =  createContentContainer();

            $modalContainer
                .toggleClass('widget-content', !!o.widgetContent)
                .toggleClass('with-background', !!o.envBackground || !!o.backgroundColor || !!o.background)
                .toggleClass('relative-font-size', !!o.relativeFontSize)
                .css('background-color', o.backgroundColor)
                .css('background', o.background);

            if (o.height)
                $modalContainer.css('--height', o.height + (typeof o.height == 'string' ? '' : 'px'));

            o.dirFrom = o.direction !== true;

            if (o.envBackground)
                $modalContainer.envBackground(o.envBackground);

            if (o.directionCircle)
                $modalContainer.addDirectionCircle(o.dirFrom, noAnimation);

            if (o.content)
                this._createInnerContent( $content, o.content, o);

            if (o.edge){
                //Add icons or text in one or more of the 8 corners
                let $cornerContainer = $('<div/>').addClass('content edge-content').appendTo($modalContainer),
                    $middleContainer,
                    middleSide = '',
                    _this = this;

                $.each(o.edge, (pos, opt) => {
                    if (!/top|middle|bottom/.test(pos))
                        pos = 'middle'+pos;

                    const isMiddle = pos.includes('middle');
                    if (isMiddle){
                        $middleContainer = $middleContainer || $('<div/>').addClass('w-100 d-flex flex-row align-items-center').appendTo($cornerContainer);
                        middleSide = middleSide ? 'BOTH' : pos;
                    }

                    let $edgePart = $('<div/>')
                            .addClass('edge-part d-flex '+pos)
                            .toggleClass('clickable', !!opt.onClick)
                            .appendTo( isMiddle ? $middleContainer : $cornerContainer ),
                        onClick = opt.onClick;

                    opt.onClick = null;
                    _this._createInnerContent($edgePart, opt);

                    if (onClick)
                        $edgePart.on('click', onClick);
                });

                if ($middleContainer)
                    $middleContainer
                        .toggleClass('justify-content-start',   middleSide == 'middleleft')
                        .toggleClass('justify-content-end',     middleSide == 'middleright')
                        .toggleClass('justify-content-between', middleSide == 'BOTH');
            } //o.edge


            //Add content for no-data
            if (o.noData){
                this.setDataAvailableOn();

                //Default no-data = "?"
                if (o.noData === true)
                    o.noData = {text: '?', size: o.noDataFontSize};

                this._createInnerContent( createContentContainer('hide-for-data-available'), o.noData, o);
            }

            return this;
        },


        /*******************************************************
        _createInnerContent
        *******************************************************/
        _createInnerContent: function($container, content, options){
            content = Array.isArray(content) ? content : [content];
            content.forEach( (contentPart) => {
                let $part = $('<div/>').appendTo($container);

                if ($.isPlainObject(contentPart)){
                    if (contentPart.size)
                        $part.addClass('size-'+contentPart.size);
                    if (contentPart.content)
                        contentPart = contentPart.content;
                }

                if (typeof contentPart == 'string'){
                    //Check if it is a standard content
                    if (standardContent[contentPart])
                        contentPart = standardContent[contentPart];
                    else
                         contentPart = {text: contentPart};
                }
                if (typeof contentPart == 'function')
                    contentPart($part, options);
                else
                    $part._bsAddHtml(contentPart);
            }, this);
        },


        /*******************************************************
        setDataAvailableOn/Off/Toggle
        *******************************************************/
        setDataAvailableOn : function(){ return this.toggleDataAvailable(true);  },
        setDataAvailableOff: function(){ return this.toggleDataAvailable(false); },
        toggleDataAvailable: function( on = !this.dataAvailable ){
            this.dataAvailable = on;
            this.$container.modernizrToggle('data-available', this.dataAvailable);
            return this;
        },


        /*******************************************************
        setValue
        *******************************************************/
        setValue: function(select, value){
            this.$container.find(select).each(  (index, elem) => { $(elem).vfValue(value); } );
            return this;
        },


        /*******************************************************
        setDirection
        *******************************************************/
        setDirection: function(direction){
            if (this.options.direction){
                this.$container.setVar('--direction', direction+'deg');
                this.setValue('.contains-direction', direction);
            }
        },

        //myMethod
        myMethod: function( /*arg1, arg2*/ ){
        },



    };

    //If FcooWidget is a extention of class "ParentClass" include the next line
    //window.FcooWidget.prototype = $.extend( {}, window.ParentClass.prototype, window.FcooWidget.prototype );

}(jQuery, this, document));