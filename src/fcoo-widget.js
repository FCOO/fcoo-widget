/****************************************************************************
    fcoo-widget.js,

    (c) 2024, FCOO

    https://github.com/FCOO/fcoo-widget
    https://github.com/FCOO

****************************************************************************/

(function ($, window/*, document, undefined*/) {
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
        header: {icon, text}

        envBackground: false or {partID: partOptions} where partId = 'space', 'cloud', 'sky', 'wave', 'ice', 'snow', 'sea', 'land', or 'seabed'. See src/environmental-background.js for details
        direction    : false, true or 'from'. If not false adds a direction-circle and arrow
        noData       : false, true or content to be shown when no data is available. true => xx-large '?'
        content      : CONTENTPART or []CONTENTPART, CONTENTPART = string, function($container) or {content, size}

        icons: ICON or []ICON, ICON={icon:string, pos:'topleft', 'topcenter', etc, onClick: function}
    }
    ********************************************************/

    /********************************************************
    Widget( options ){
    ********************************************************/
    function Widget( options ){
        this.options = $.extend(true, {
            //Default options
        }, options || {} );





        //If Widget is a extention of class "ParentClass" include the next line
        //window.ParentClass.call(this, input, options, plugin_count );


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
        createContent
        *******************************************************/
        createContent: function($container){
            this.$container = $container;
            $container.addClass('widget-container');

            let o = this.options,
                noAnimation = o.noAnimation,
                $content = this.$content =  this._createContentContainer();

            o.dirFrom = o.direction !== true;

            if (o.envBackground)
                $container.envBackground(o.envBackground);

            if (o.direction)
                $container.addDirectionCircle(o.dirFrom, noAnimation);

            if (o.content)
                this._createInnerContent( $content, o.content);

            if (o.edge){

                //Add icons or text in one or more of the 8 corners
                let $cornerContainer = $('<div/>').addClass('content edge-content').appendTo(this.$container),
                    $middleContainer,
                    middleSide = '',
                    _this = this;
//                ['topleft', 'topcenter', 'topright', 'left', 'middleright', 'bottomleft', 'bottomcenter', 'bottomright'].forEach( (pos) => {
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
            }; //o.edge



            //Add content for no-data
            if (o.noData){
                this.setDataAvailableOn();

                //Default no-data = "?"
                if (o.noData === true)
                    o.noData = {text: '?', size: 'xxl'}

                this._createInnerContent( this._createContentContainer('hide-for-data-available'), o.noData);
            }

            return this;
        },

        /*******************************************************
        _createContentContainer
        *******************************************************/
        _createContentContainer: function(className = 'show-for-data-available'){
            return $('<div/>')
                        .addClass('content')
                        .addClass(className)
                        .appendTo(this.$container);
        },

        /*******************************************************
        _createInnerContent
        *******************************************************/
        _createInnerContent: function($container, content){
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
                    contentPart($part, this.options);
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