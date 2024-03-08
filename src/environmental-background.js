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
    const getEnvPartName = (env) => 'fcoo-env-' + env  + '-color';
    const getEnvPartVar  = (env) => 'var(--' + getEnvPartName(env)  + ')';
    /*
    const setEnvBG = ($elem, env) => {
        $elem.addClass( getEnvPartName(env) );
        return $elem;
    }
    */

    const   defaultPartsOptions = {
                ice     : {height: 2},
                snow    : {height: 3},

                wave    : {className: 'wave', height: 0, size: 'normal'},
                land    : {bottom: true},
                seabed  : {bottom: true},

            },
            defaultPartOptions = {
                height: 5,
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
// HER>             if (options.surface == partId)
// HER>                 options[partId] = options[partId] || true;
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
                            case 'top'   : surfacePos =  5; break;
                            case 'bottom': surfacePos = 95; break;
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
        const   radius  = 40,
                majorTickLgd = 3,
                majorTicks   = 4,

                minorTickLgd = 1.25,
                minorTicks   = 16,

                arrow_width      = 10,
                arrow_half_width = arrow_width/2,
                arrow_height     = 1.25*arrow_width,
                c_cross = 2 / 3 * arrow_height, //The point where the circle cross the arrow
                arrow_points = [50,50, 50+arrow_half_width, 50+arrow_height,   50-arrow_half_width, 50+arrow_height];//, 50, 50,  50, 50+arrow_height];

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
                '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="svg">' +
                    '<circle cx="50" cy="50" r="'+radius+'" class="direction-circle"/></circle>' +
                    '<path xmlns="http://www.w3.org/2000/svg" class="direction-circle" d="'+dirPath+'"/>' +
                '</svg>' +
                //Arrow
                '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" class="svg hide-for-no-data-available rotatable'+(noAnimation ? ' no-transition-duration' : '')+'">' +
                    '<polygon class="direction-arrow" '+
                        'points="' + arrow_points.join(' ') + '" '+
                        'transform="scale(1) translate(0, ' + (directionFrom ? radius - c_cross : -radius - c_cross) + ')">'+
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