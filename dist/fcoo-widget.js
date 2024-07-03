/****************************************************************************
environmental-background.js

Create background in element with

****************************************************************************/

(function ($/*, window, document, undefined*/) {
    "use strict";

    //Create fcoo-namespace
    var ns = window.fcoo = window.fcoo || {},
        nsWidget = ns.widget = ns.widget || {};


    /************************************************************
    environmentalBackground
    Create the background with diffent "environmental" parts:
    space, sky, cloud, wave, ice, snow, sea, land, and seabed
    options = {ID: OPTION}

    ID = 'space', 'sky', 'cloud', 'wave', 'ice', 'snow', 'sea', 'land', or 'seabed'

    ************************************************************/
    const   defaultPartHeight = 5,
            getEnvPartName = (env) => 'fcoo-env-' + env  + '-color',
            getEnvPartVar  = (env) => 'var(--' + getEnvPartName(env)  + ')',
            defaultPartsOptions = {
                ice     : {height: 2},
                snow    : {height: 3},

                wave    : {className: 'wave', height: 0, size: 'normal'},
                land    : {bottom: true},
                seabed  : {bottom: true},

            },
            defaultPartOptions = {
                height: defaultPartHeight,
                bottom: false
            };


    /************************************************************
    environmentalBackground
    ************************************************************/
    nsWidget.environmentalBackground = nsWidget.envBackground = ($elem, options) => {
        $elem.addClass('env-background');

        //Create a css for background a la background: linear-gradient(COLOR#1 0%, COLOR#1 10%, COLOR#2 10%, COLOR#2 40%, ...)
        let pos = 0,
            bgPos = 0,
            bgHeight = 0,
            backgroundList = [], //[]{id, pos}
            partOptionsList;

        function addOpt(opt = {}){ if (typeof opt === 'object') partOptionsList.push(opt); }


        ['space', 'cloud', 'sky', 'wave', 'ice', 'snow', 'sea', 'land', 'seabed'].forEach( partId => {
            partOptionsList = [{}];

            if (options[partId] || (options.surface == partId)){
                //Get and combine all options
                addOpt(defaultPartOptions);
                addOpt(defaultPartsOptions[partId]);
                let partOptions = options[partId];
                if (typeof partOptions == 'number')
                    partOptions = {height: partOptions};
                addOpt(partOptions);

                partOptions = $.extend.apply(null, partOptionsList);

                if (partOptions.className)
                    //Create a div-element
                    $('<div/>')
                        .addClass(partOptions.className)
                        .toggleClass(partOptions.className+'-sm', partOptions.size == 'small')
                        .toggleClass(partOptions.className+'-lg', partOptions.size == 'large')
                        .toggleClass('surface', options.surface == partId)
                        .appendTo($elem);

                //Set pos and height
                bgPos = 0;
                bgHeight = partOptions.height || 0;

                //Set position
                if (partOptions.bottom)
                    bgPos = 100 - partOptions.height;
                else
                    if (options.surface == partId){
                        let surfacePos = 50;
                        switch (options.surfacePos || 'middle'){
                            case 'top'   : surfacePos = defaultPartHeight; break;
                            case 'bottom': surfacePos = 100 - defaultPartHeight; break;
                            case 'middle': surfacePos = 50; break;
                        }
                        $elem.setVar('--surface-position', surfacePos+'%');
                        $elem.setVar('--surface-height', surfacePos+'%');

                        const halfHeight = bgHeight / 2;
                        bgPos = surfacePos - halfHeight;
                        pos = pos - halfHeight;
                    }
                    else
                        bgPos = pos;


                backgroundList.push({id: partId, pos: bgPos, height: bgHeight});

                pos += bgHeight;
            }
        }); //End of part-id-list


        if (bgPos < 100){
            if (options.main)
                backgroundList.push({id: options.main, pos: pos});
            backgroundList.push({pos: 100});
        }

        //Adjust and sort list of backgrounds
        backgroundList.forEach((part, index) => {part.index = index;});
        backgroundList.sort((part1, part2) => {
            if (part1.pos == part2.pos)
                return part1.index - part2.index;
            return part1.pos - part2.pos;
        });

        //Create string with colors and heights in %
        let background = '';
        let totalPos = 0;
        for (var i=1; i<backgroundList.length; i++){
            let nextPos = backgroundList[i].pos,
                varId = getEnvPartVar( backgroundList[i-1].id ),
                height = nextPos - totalPos;
            if (backgroundList[i-1].height === 0)
                height = 0;
            if (height){
                background = background +
                        (background ? ',' : '') +
                        varId+' '+totalPos+'%, '+ varId+' '+nextPos+'%';
                totalPos = nextPos;
            }
        }
        $elem.css('background', 'linear-gradient('+background+')');
    };

    /************************************************************
    addDirectionCircle
    ************************************************************/
    nsWidget.addDirectionCircle = ($elem, directionFrom, noAnimation) => {
        const   radius  = 38,//40,
                majorTickLgd = 3,
                majorTicks   = 4,

                minorTickLgd = 1.25,
                minorTicks   = 16,

                arrow_width      = 11,
                arrow_half_width = arrow_width/2,
                arrow_height     = 1.25*arrow_width,
                c_cross = 0.4 * arrow_height, //The point where the circle cross the arrow
                transformY = -4/100*radius + (directionFrom ? 2*radius : 0) + c_cross, //-4/100*radius = move arrow to circle
                arrow_points = [arrow_half_width,0, arrow_width,arrow_height, 0,arrow_height];

        //Create svg-path with ticks on the circle
        let dirPath = '';
        for (var tick = 0; tick < minorTicks; tick++){
            let dir = tick * 2 * Math.PI / minorTicks,
                cos = Math.cos(dir),
                sin = Math.sin(dir),
                r1  = radius + .5,
                r2  = radius + .5 + (tick % majorTicks ? minorTickLgd : majorTickLgd),
                x1 = 50 + r1 * cos, y1 = 50 + r1 * sin,
                x2 = 50 + r2 * cos, y2 = 50 + r2 * sin;

            dirPath += 'M'+x1+' '+y1+ ' L'+x2+' '+y2;
        }

        let $result = $(
                //Circle with 'compas'-dots
                '<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="svg">' +
                    '<circle cx="50" cy="50" r="'+radius+'" class="no-fill"/></circle>' +
                    '<path xmlns="http://www.w3.org/2000/svg" class="_no-fill" d="'+dirPath+'"/>' +
                '</svg>' +

                //Arrow
                '<svg viewBox="0 0 '+arrow_width+' 100" preserveAspectRatio="xMidYMid meet" class="svg svg-arrow hide-for-no-data-available rotatable'+(noAnimation ? ' no-transition-duration' : '')+'">' +
                    '<polygon class="direction-arrow semi-transparent-fill" '+
                        'points="' + arrow_points.join(' ') + '" '+
                        'transform="scale(1) translate(0,'+transformY+')">'+
                    '</polygon>' +
                '</svg>' +
                ''
            ).appendTo($elem);

        return $result;
   };

    //Add new methods to jQuery prototype
    $.fn.extend({
        envBackground: function(options){
            return this.each(function() {
                nsWidget.envBackground($(this), options);
            });
        },
        addDirectionCircle: function(directionFrom, noAnimation){
            return this.each(function() {
                nsWidget.addDirectionCircle($(this), directionFrom, noAnimation);
            });
        }
    });
    $.fn.environmentalBackground = $.fn.envBackground;


    /************************************************************
    Define default options for environmentalBackground
    ************************************************************/
    const inSea = {
            surface   : 'wave',
            surfacePos: 'top',
            main      : 'sea',
            sky       : true
          },
          inAir = {
            surfacePos: 'bottom',
            main      : 'sky'
          },
          onSurface = {
            sky       : {height: 50},
            surfacePos: 'middle',
          };

    function extend(opt1, opt2, opt3 = {}){
        return $.extend(true, {}, opt1, opt2, opt3);
    }

    nsWidget.envBackgroundOptions = nsWidget.environmentalBackgroundOptions = {
        sky             : {main: 'sky'},
        sky_over_sea    : extend({surface: 'wave', sea: {bottom: true}}, inAir),
        sky_over_land   : extend({land: true}, inAir),

        sea             : {main: 'sea'},
        sea_near_surface: inSea,
        sea_near_seabed : {main: 'sea', seabed: true},

        ice_on_sea      : extend({surface: 'ice',  main: 'sea' }, onSurface),
        snow_on_land    : extend({surface: 'snow', main: 'land'}, onSurface),

        wave            : extend({surface: 'wave', wave: {size: 'large'}, main: 'sea'}, onSurface),

        seabed          : {sea: 50, seabed: 50},

        water_column    : extend({seabed: true}, inSea)

    };



/* TODO:
half cloud half sky         {
            cloud: {height: 50},
            main: 'sky'
        }, onSurface

*/


}(jQuery, this, document));
;
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

            this.$edge = {};
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

                    let $edgePart = this.$edge[pos] = $('<div/>')
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