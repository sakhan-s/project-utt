;(function($, window, undefined) {
    'use strict';
    var $body = $('body');
    $.DLMenu = function(options, element) {
        this.$el = $(element);
        this._init(options);
    }
    ;
    $.DLMenu.defaults = {
        animationClasses: {
            classin: 'dl-animate-in-1',
            classout: 'dl-animate-out-1'
        },
        onLevelClick: function(el, name) {
            return false;
        },
        onLinkClick: function(el, ev) {
            return false;
        },
        backLabel: 'Back',
        showCurrentLabel: 'Show this page',
        useActiveItemAsBackLabel: false,
        useActiveItemAsLink: true
    };
    $.DLMenu.prototype = {
        _init: function(options) {
            this.options = $.extend(true, {}, $.DLMenu.defaults, options);
            this._config();
            var animEndEventNames = {
                'WebkitAnimation': 'webkitAnimationEnd',
                'OAnimation': 'oAnimationEnd',
                'msAnimation': 'MSAnimationEnd',
                'animation': 'animationend',
                "MozAnimation": "animationend"
            }
              , transEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'msTransition': 'MSTransitionEnd',
                'transition': 'transitionend'
            };
            if (animEndEventNames[window.supportedAnimation] != undefined) {
                this.animEndEventName = animEndEventNames[window.supportedAnimation] + '.dlmenu';
            } else {
                this.animEndEventName = animEndEventNames['animation'] + '.dlmenu';
            }
            if (transEndEventNames[window.supportedTransition] != undefined) {
                this.transEndEventName = transEndEventNames[window.supportedTransition] + '.dlmenu';
            } else {
                this.transEndEventName = transEndEventNames['transition'] + '.dlmenu';
            }
            this.supportAnimations = window.supportsAnimations;
            this.supportTransitions = window.supportsTransitions;
            this._initEvents();
        },
        _config: function() {
            var self = this;
            this.open = false;
            this.$trigger = this.$el.hasClass('primary-navigation') && $('#perspective-menu-buttons').length > 0 ? $('#perspective-menu-buttons .dl-trigger') : this.$el.find('.dl-trigger:first');
            this.$menu = this.$el.find('ul.dl-menu:first');
            this.$menuitems = this.$menu.find('li:not(.dl-back):not(.not-dlmenu)');
            this.$el.find('ul.dl-submenu').prepend('<li class="dl-back"><a href="#">' + this.options.backLabel + '</a></li>');
            this.$back = this.$menu.find('li.dl-back');
            if (this.options.useActiveItemAsBackLabel) {
                this.$back.each(function() {
                    var $this = $(this)
                      , parentLabel = $this.parents('li:first').find('a:first').text();
                    $this.find('a').html(parentLabel);
                });
            }
            if (this.options.useActiveItemAsLink) {
                this.$el.find('ul.dl-submenu').prepend(function() {
                    var activeLi = $(this).parents('li:not(.dl-back):first');
                    var parentli = activeLi.find('a:first');
                    if (activeLi.hasClass('mobile-clickable'))
                        return '<li class="dl-parent"><a href="' + parentli.attr('href') + '">' + self.options.showCurrentLabel + '</a></li>';
                    else
                        return '';
                });
            }
        },
        _initEvents: function() {
            var self = this;
            this.$trigger.on('click.dlmenu', function() {
                if (self.open) {
                    self._closeMenu();
                } else {
                    self._openMenu();
                    $body.off('click').children().on('click.dlmenu', function() {
                        self._closeMenu();
                    });
                }
                return false;
            });
            this.$menuitems.on('click.dlmenu', function(event) {
                event.stopPropagation();
                var $item = $(this)
                  , $submenu = $item.children('ul.dl-submenu')
                  , level = 1;
                if (!self.$menu.hasClass('dl-menuopen')) {
                    self.options.onLinkClick($item, event);
                    return;
                }
                var $itemList = $item.parent();
                while ($itemList.attr('id') != 'primary-menu') {
                    if ($itemList[0].nodeName.toUpperCase() == 'UL') {
                        level++;
                    }
                    $itemList = $itemList.parent();
                    if (!$itemList.length) {
                        break;
                    }
                }
                if (level > 3) {
                    level = 3;
                }
                if (($submenu.length > 0) && !($(event.currentTarget).hasClass('dl-subviewopen'))) {
                    var $flyin = $submenu.clone().addClass('level' + (level + 1)).css('opacity', 0).insertAfter(self.$menu)
                      , onAnimationEndFn = function() {
                        self.$menu.off(self.animEndEventName).removeClass(self.options.animationClasses.classout).addClass('dl-subview');
                        $item.addClass('dl-subviewopen').parents('.dl-subviewopen:first').removeClass('dl-subviewopen').addClass('dl-subview');
                        $flyin.remove();
                    };
                    setTimeout(function() {
                        $flyin.addClass(self.options.animationClasses.classin);
                        self.$menu.addClass(self.options.animationClasses.classout);
                        if (self.supportAnimations) {
                            self.$menu.on(self.animEndEventName, onAnimationEndFn);
                        } else {
                            onAnimationEndFn.call();
                        }
                        self.options.onLevelClick($item, $item.children('a:first').text());
                    });
                    return false;
                } else {
                    self.options.onLinkClick($item, event);
                }
            });
            this.$back.on('click.dlmenu', function(event) {
                var $this = $(this)
                  , $submenu = $this.parents('ul.dl-submenu:first')
                  , $item = $submenu.parent()
                  , level = 1;
                var $itemList = $this.parent();
                while ($itemList.attr('id') != 'primary-menu') {
                    if ($itemList[0].nodeName.toUpperCase() == 'UL') {
                        level++;
                    }
                    $itemList = $itemList.parent();
                    if (!$itemList.length) {
                        break;
                    }
                }
                if (level > 3) {
                    level = 3;
                }
                var $flyin = $submenu.clone().addClass('level' + level).insertAfter(self.$menu);
                var onAnimationEndFn = function() {
                    self.$menu.off(self.animEndEventName).removeClass(self.options.animationClasses.classin);
                    $flyin.remove();
                };
                setTimeout(function() {
                    $flyin.addClass(self.options.animationClasses.classout);
                    self.$menu.addClass(self.options.animationClasses.classin);
                    if (self.supportAnimations) {
                        self.$menu.on(self.animEndEventName, onAnimationEndFn);
                    } else {
                        onAnimationEndFn.call();
                    }
                    $item.removeClass('dl-subviewopen');
                    var $subview = $this.parents('.dl-subview:first');
                    if ($subview.is('li')) {
                        $subview.addClass('dl-subviewopen');
                    }
                    $subview.removeClass('dl-subview');
                });
                return false;
            });
        },
        closeMenu: function() {
            if (this.open) {
                this._closeMenu();
            }
        },
        _closeMenu: function() {
            var self = this
              , onTransitionEndFn = function() {
                self.$menu.off(self.transEndEventName);
                self._resetMenu();
            };
            this.$menu.removeClass('dl-menuopen');
            this.$menu.addClass('dl-menu-toggle');
            this.$trigger.removeClass('dl-active');
            if (this.supportTransitions) {
                this.$menu.on(this.transEndEventName, onTransitionEndFn);
            } else {
                onTransitionEndFn.call();
            }
            this.open = false;
        },
        openMenu: function() {
            if (!this.open) {
                this._openMenu();
            }
        },
        _openMenu: function() {
            var self = this;
            $body.off('click').on('click.dlmenu', function() {
                self._closeMenu();
            });
            this.$menu.addClass('dl-menuopen dl-menu-toggle').on(this.transEndEventName, function() {
                $(this).removeClass('dl-menu-toggle');
            });
            this.$trigger.addClass('dl-active');
            this.open = true;
        },
        _resetMenu: function() {
            this.$menu.removeClass('dl-subview');
            this.$menuitems.removeClass('dl-subview dl-subviewopen');
        }
    };
    var logError = function(message) {
        if (window.console) {
            window.console.error(message);
        }
    };
    $.fn.dlmenu = function(options) {
        if (typeof options === 'string') {
            var args = Array.prototype.slice.call(arguments, 1);
            this.each(function() {
                var instance = $.data(this, 'dlmenu');
                if (!instance) {
                    logError("cannot call methods on dlmenu prior to initialization; " + "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for dlmenu instance");
                    return;
                }
                instance[options].apply(instance, args);
            });
        } else {
            this.each(function() {
                var instance = $.data(this, 'dlmenu');
                if (instance) {
                    instance._init();
                } else {
                    instance = $.data(this, 'dlmenu', new $.DLMenu(options,this));
                }
            });
        }
        return this;
    }
    ;
}
)(jQuery, window);
;function supportsTransitions() {
    return getSupportedTransition() != '';
}
function getSupportedTransition() {
    var b = document.body || document.documentElement
      , s = b.style
      , p = 'transition';
    if (typeof s[p] == 'string') {
        return p;
    }
    var v = ['Moz', 'webkit', 'Webkit', 'Khtml', 'O', 'ms'];
    p = p.charAt(0).toUpperCase() + p.substr(1);
    for (var i = 0; i < v.length; i++) {
        if (typeof s[v[i] + p] == 'string') {
            return true;
        }
    }
    return '';
}
window.supportedTransition = getSupportedTransition();
window.supportsTransitions = supportsTransitions();
function supportsAnimations() {
    return getSupportedAnimation() != '';
}
function getSupportedAnimation() {
    var t, el = document.createElement("fakeelement");
    var animations = {
        "animation": "animationend",
        "OAnimation": "oAnimationEnd",
        "MozAnimation": "animationend",
        "WebkitAnimation": "webkitAnimationEnd",
        'msAnimation': 'MSAnimationEnd'
    };
    for (t in animations) {
        if (el.style[t] !== undefined) {
            return t;
        }
    }
    return '';
}
window.supportedAnimation = getSupportedAnimation();
window.supportsAnimations = supportsAnimations();
function getMobileMenuType() {
    if (!document.getElementById('site-header'))
        return 'default';
    var m = document.getElementById('site-header').className.match(/mobile-menu-layout-([a-zA-Z0-9]+)/);
    window.gemMobileMenuType = m ? m[1] : 'default';
    return window.gemMobileMenuType;
}
getMobileMenuType();
(function() {
    var logoFixTimeout = false;
    window.thegemDesktopMenuLogoFixed = false;
    window.thegemWasDesktop = false;
    window.megaMenuWithSettingsFixed = false;
    function getElementPosition(elem) {
        var w = elem.offsetWidth
          , h = elem.offsetHeight
          , l = 0
          , t = 0;
        while (elem) {
            l += elem.offsetLeft;
            t += elem.offsetTop;
            elem = elem.offsetParent;
        }
        return {
            "left": l,
            "top": t,
            "width": w,
            "height": h
        };
    }
    function fixMenuLogoPosition() {
        if (logoFixTimeout) {
            clearTimeout(logoFixTimeout);
        }
        var headerMain = document.querySelector('#site-header .header-main');
        if (headerMain == null) {
            return false;
        }
        var headerMainClass = headerMain.className;
        if (headerMainClass.indexOf('logo-position-menu_center') == -1 || headerMainClass.indexOf('header-layout-fullwidth_hamburger') != -1 || headerMainClass.indexOf('header-layout-vertical') != -1) {
            return false;
        }
        logoFixTimeout = setTimeout(function() {
            var page = document.getElementById('page')
              , primaryMenu = document.getElementById('primary-menu')
              , primaryNavigation = document.getElementById('primary-navigation')
              , windowWidth = page.offsetWidth
              , pageComputedStyles = window.getComputedStyle(page, null)
              , pageMargin = parseFloat(pageComputedStyles['marginLeft']);
            if (isNaN(pageMargin)) {
                pageMargin = 0;
            }
            if (headerMainClass.indexOf('header-layout-fullwidth') != -1) {
                var logoItem = primaryMenu.querySelector('.menu-item-logo')
                  , items = primaryNavigation.querySelectorAll('#primary-menu > li')
                  , lastItem = null;
                for (var i = items.length - 1; i >= 0; i--) {
                    if (items[i].className.indexOf('mobile-only') == -1) {
                        lastItem = items[i];
                        break;
                    }
                }
                primaryMenu.style.display = '';
                logoItem.style.marginLeft = '';
                logoItem.style.marginRight = '';
                if (windowWidth < 1212 || lastItem === null) {
                    return;
                }
                window.thegemDesktopMenuLogoFixed = true;
                primaryMenu.style.display = 'block';
                var pageCenter = windowWidth / 2 + pageMargin
                  , logoOffset = getElementPosition(logoItem)
                  , offset = pageCenter - logoOffset.left - logoItem.offsetWidth / 2;
                logoItem.style.marginLeft = offset + 'px';
                var primaryMenuOffsetWidth = primaryMenu.offsetWidth
                  , primaryMenuOffsetLeft = getElementPosition(primaryMenu).left
                  , lastItemOffsetWidth = lastItem.offsetWidth
                  , lastItemOffsetLeft = getElementPosition(lastItem).left
                  , rightItemsOffset = primaryMenuOffsetWidth - lastItemOffsetLeft - lastItemOffsetWidth + primaryMenuOffsetLeft;
                logoItem.style.marginRight = rightItemsOffset + 'px';
            } else {
                if (windowWidth < 1212) {
                    primaryNavigation.style.textAlign = '';
                    primaryMenu.style.position = '';
                    primaryMenu.style.left = '';
                    return;
                }
                window.thegemDesktopMenuLogoFixed = true;
                primaryNavigation.style.textAlign = 'left';
                primaryMenu.style.left = 0 + 'px';
                var pageCenter = windowWidth / 2
                  , primaryMenuOffsetLeft = getElementPosition(primaryMenu).left
                  , logoOffset = getElementPosition(document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo'))
                  , pageOffset = getElementPosition(page)
                  , offset = pageCenter - (logoOffset.left - pageOffset.left) - document.querySelector('#site-header .header-main #primary-navigation .menu-item-logo').offsetWidth / 2;
                if (primaryMenuOffsetLeft + offset >= 0) {
                    primaryMenu.style.position = 'relative';
                    primaryMenu.style.left = offset + 'px';
                } else {
                    primaryMenu.style.position = '';
                    primaryMenu.style.left = '';
                }
            }
            primaryMenu.style.opacity = '1';
        }, 50);
    }
    window.fixMenuLogoPosition = fixMenuLogoPosition;
    if (window.gemOptions.clientWidth > 1212) {
        window.addEventListener('load', function(event) {
            window.fixMenuLogoPosition();
        }, false);
    }
}
)();
(function($) {
    var isVerticalMenu = $('.header-main').hasClass('header-layout-vertical')
      , isHamburgerMenu = $('.header-main').hasClass('header-layout-fullwidth_hamburger')
      , isPerspectiveMenu = $('#thegem-perspective').length > 0;
    $(window).resize(function() {
        window.updateGemClientSize(false);
        window.updateGemInnerSize();
    });
    window.menuResizeTimeoutHandler = false;
    var megaMenuSettings = {};
    function getOffset(elem) {
        if (elem.getBoundingClientRect && window.gemBrowser.platform.name != 'ios') {
            var bound = elem.getBoundingClientRect()
              , html = elem.ownerDocument.documentElement
              , htmlScroll = getScroll(html)
              , elemScrolls = getScrolls(elem)
              , isFixed = (styleString(elem, 'position') == 'fixed');
            return {
                x: parseInt(bound.left) + elemScrolls.x + ((isFixed) ? 0 : htmlScroll.x) - html.clientLeft,
                y: parseInt(bound.top) + elemScrolls.y + ((isFixed) ? 0 : htmlScroll.y) - html.clientTop
            };
        }
        var element = elem
          , position = {
            x: 0,
            y: 0
        };
        if (isBody(elem))
            return position;
        while (element && !isBody(element)) {
            position.x += element.offsetLeft;
            position.y += element.offsetTop;
            if (window.gemBrowser.name == 'firefox') {
                if (!borderBox(element)) {
                    position.x += leftBorder(element);
                    position.y += topBorder(element);
                }
                var parent = element.parentNode;
                if (parent && styleString(parent, 'overflow') != 'visible') {
                    position.x += leftBorder(parent);
                    position.y += topBorder(parent);
                }
            } else if (element != elem && window.gemBrowser.name == 'safari') {
                position.x += leftBorder(element);
                position.y += topBorder(element);
            }
            element = element.offsetParent;
        }
        if (window.gemBrowser.name == 'firefox' && !borderBox(elem)) {
            position.x -= leftBorder(elem);
            position.y -= topBorder(elem);
        }
        return position;
    }
    ;function getScroll(elem) {
        return {
            x: window.pageXOffset || document.documentElement.scrollLeft,
            y: window.pageYOffset || document.documentElement.scrollTop
        };
    }
    ;function getScrolls(elem) {
        var element = elem.parentNode
          , position = {
            x: 0,
            y: 0
        };
        while (element && !isBody(element)) {
            position.x += element.scrollLeft;
            position.y += element.scrollTop;
            element = element.parentNode;
        }
        return position;
    }
    ;function styleString(element, style) {
        return $(element).css(style);
    }
    ;function styleNumber(element, style) {
        return parseInt(styleString(element, style)) || 0;
    }
    ;function borderBox(element) {
        return styleString(element, '-moz-box-sizing') == 'border-box';
    }
    ;function topBorder(element) {
        return styleNumber(element, 'border-top-width');
    }
    ;function leftBorder(element) {
        return styleNumber(element, 'border-left-width');
    }
    ;function isBody(element) {
        return (/^(?:body|html)$/i).test(element.tagName);
    }
    ;function checkMegaMenuSettings() {
        if (window.customMegaMenuSettings == undefined || window.customMegaMenuSettings == null) {
            return false;
        }
        var uri = window.location.pathname;
        window.customMegaMenuSettings.forEach(function(item) {
            for (var i = 0; i < item.urls.length; i++) {
                if (uri.match(item.urls[i])) {
                    megaMenuSettings[item.menuItem] = item.data;
                }
            }
        });
    }
    function fixMegaMenuWithSettings() {
        if (isResponsiveMenuVisible() && !window.thegemWasDesktop) {
            return false;
        }
        window.megaMenuWithSettingsFixed = true;
        checkMegaMenuSettings();
        $('#primary-menu > li.megamenu-enable').each(function() {
            var m = this.className.match(/(menu-item-(\d+))/);
            if (!m) {
                return;
            }
            var itemId = parseInt(m[2]);
            if (megaMenuSettings[itemId] == undefined || megaMenuSettings[itemId] == null) {
                return;
            }
            var $item = $('> ul', this);
            if (megaMenuSettings[itemId].masonry != undefined) {
                if (megaMenuSettings[itemId].masonry) {
                    $item.addClass('megamenu-masonry');
                } else {
                    $item.removeClass('megamenu-masonry');
                }
            }
            if (megaMenuSettings[itemId].style != undefined) {
                $(this).removeClass('megamenu-style-default megamenu-style-grid').addClass('megamenu-style-' + megaMenuSettings[itemId].style);
            }
            var css = {};
            if (megaMenuSettings[itemId].backgroundImage != undefined) {
                css.backgroundImage = megaMenuSettings[itemId].backgroundImage;
            }
            if (megaMenuSettings[itemId].backgroundPosition != undefined) {
                css.backgroundPosition = megaMenuSettings[itemId].backgroundPosition;
            }
            if (megaMenuSettings[itemId].padding != undefined) {
                css.padding = megaMenuSettings[itemId].padding;
            }
            if (megaMenuSettings[itemId].borderRight != undefined) {
                css.borderRight = megaMenuSettings[itemId].borderRight;
            }
            $item.css(css);
        });
    }
    function isResponsiveMenuVisible() {
        return $('.primary-navigation .menu-toggle').is(':visible');
    }
    window.isResponsiveMenuVisible = isResponsiveMenuVisible;
    function isTopAreaVisible() {
        return window.gemSettings.topAreaMobileDisable ? window.gemOptions.clientWidth >= 768 : true;
    }
    window.isTopAreaVisible = isTopAreaVisible;
    function isVerticalToggleVisible() {
        return window.gemOptions.clientWidth > 1600;
    }
    $('#primary-menu > li.megamenu-enable').hover(function() {
        fix_megamenu_position(this);
    }, function() {});
    $('#primary-menu > li.megamenu-enable:hover').each(function() {
        fix_megamenu_position(this);
    });
    $('#primary-menu > li.megamenu-enable').each(function() {
        var $item = $('> ul', this);
        if ($item.length == 0)
            return;
        $item.addClass('megamenu-item-inited');
    });
    function fix_megamenu_position(elem, containerWidthCallback) {
        if (!$('.megamenu-inited', elem).length && isResponsiveMenuVisible()) {
            return false;
        }
        var $item = $('> ul', elem);
        if ($item.length == 0)
            return;
        var self = $item.get(0);
        $item.addClass('megamenu-item-inited');
        var default_item_css = {
            width: 'auto',
            height: 'auto'
        };
        if (!isVerticalMenu && !isHamburgerMenu && !isPerspectiveMenu) {
            default_item_css.left = 0;
        }
        $item.removeClass('megamenu-masonry-inited megamenu-fullwidth').css(default_item_css);
        $(' > li', $item).css({
            left: 0,
            top: 0
        }).each(function() {
            var old_width = $(this).data('old-width') || -1;
            if (old_width != -1) {
                $(this).width(old_width).data('old-width', -1);
            }
        });
        if (isResponsiveMenuVisible()) {
            return;
        }
        if (containerWidthCallback !== undefined) {
            var container_width = containerWidthCallback();
        } else if (isVerticalMenu) {
            var container_width = window.gemOptions.clientWidth - $('#site-header-wrapper').outerWidth();
        } else if (isPerspectiveMenu) {
            var container_width = window.gemOptions.clientWidth - $('#primary-navigation').outerWidth();
        } else if (isHamburgerMenu) {
            var container_width = window.gemOptions.clientWidth - $('#primary-menu').outerWidth();
        } else {
            var $container = $item.closest('.header-main')
              , container_width = $container.width()
              , container_padding_left = parseInt($container.css('padding-left'))
              , container_padding_right = parseInt($container.css('padding-right'))
              , parent_width = $item.parent().outerWidth();
        }
        var megamenu_width = $item.outerWidth();
        if (megamenu_width > container_width) {
            megamenu_width = container_width;
            var new_megamenu_width = container_width - parseInt($item.css('padding-left')) - parseInt($item.css('padding-right'));
            var columns = $item.data('megamenu-columns') || 4;
            var column_width = parseFloat(new_megamenu_width - columns * parseInt($(' > li.menu-item:first', $item).css('margin-left'))) / columns;
            var column_width_int = parseInt(column_width);
            $(' > li', $item).each(function() {
                $(this).data('old-width', $(this).width()).css('width', column_width_int);
            });
            $item.addClass('megamenu-fullwidth').width(new_megamenu_width - (column_width - column_width_int) * columns);
        }
        if (!isVerticalMenu && !isHamburgerMenu && !isPerspectiveMenu && containerWidthCallback === undefined) {
            if (megamenu_width > parent_width) {
                var left = -(megamenu_width - parent_width) / 2;
            } else {
                var left = 0;
            }
            var container_offset = getOffset($container[0]);
            var megamenu_offset = getOffset(self);
            if ((megamenu_offset.x - container_offset.x - container_padding_left + left) < 0) {
                left = -(megamenu_offset.x - container_offset.x - container_padding_left);
            }
            if ((megamenu_offset.x + megamenu_width + left) > (container_offset.x + $container.outerWidth() - container_padding_right)) {
                left -= (megamenu_offset.x + megamenu_width + left) - (container_offset.x + $container.outerWidth() - container_padding_right);
            }
            $item.css('left', left).css('left');
        }
        if ($item.hasClass('megamenu-masonry')) {
            var positions = {}
              , max_bottom = 0;
            $item.width($item.width() - 1);
            var new_row_height = $('.megamenu-new-row', $item).outerHeight() + parseInt($('.megamenu-new-row', $item).css('margin-bottom'));
            $('> li.menu-item', $item).each(function() {
                var pos = $(this).position();
                if (positions[pos.left] != null && positions[pos.left] != undefined) {
                    var top_position = positions[pos.left];
                } else {
                    var top_position = pos.top;
                }
                positions[pos.left] = top_position + $(this).outerHeight() + new_row_height + parseInt($(this).css('margin-bottom'));
                if (positions[pos.left] > max_bottom)
                    max_bottom = positions[pos.left];
                $(this).css({
                    left: pos.left,
                    top: top_position
                })
            });
            $item.height(max_bottom - new_row_height - parseInt($item.css('padding-top')) - 1);
            $item.addClass('megamenu-masonry-inited');
        }
        if ($item.hasClass('megamenu-empty-right')) {
            var mega_width = $item.width();
            var max_rights = {
                columns: [],
                position: -1
            };
            $('> li.menu-item', $item).removeClass('megamenu-no-right-border').each(function() {
                var pos = $(this).position();
                var column_right_position = pos.left + $(this).width();
                if (column_right_position > max_rights.position) {
                    max_rights.position = column_right_position;
                    max_rights.columns = [];
                }
                if (column_right_position == max_rights.position) {
                    max_rights.columns.push($(this));
                }
            });
            if (max_rights.columns.length && max_rights.position >= (mega_width - 7)) {
                max_rights.columns.forEach(function($li) {
                    $li.addClass('megamenu-no-right-border');
                });
            }
        }
        if (isVerticalMenu || isHamburgerMenu || isPerspectiveMenu) {
            var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
              , itemOffset = $item.offset()
              , itemHeight = $item.outerHeight()
              , scrollTop = $(window).scrollTop();
            if (itemOffset.top - scrollTop + itemHeight > clientHeight) {
                $item.css({
                    top: clientHeight - itemOffset.top + scrollTop - itemHeight - 20
                });
            }
        }
        $item.addClass('megamenu-inited');
    }
    window.fix_megamenu_position = fix_megamenu_position;
    function primary_menu_reinit() {
        if (isResponsiveMenuVisible()) {
            if (window.gemMobileMenuType == 'default') {
                var $submenuDisabled = $('#primary-navigation .dl-submenu-disabled');
                if ($submenuDisabled.length) {
                    $submenuDisabled.addClass('dl-submenu').removeClass('dl-submenu-disabled');
                }
            }
            if ($('#primary-menu').hasClass('no-responsive')) {
                $('#primary-menu').removeClass('no-responsive');
            }
            if (!$('#primary-navigation').hasClass('responsive')) {
                $('#primary-navigation').addClass('responsive');
            }
            $('.menu-overlay').addClass('mobile');
            if (window.thegemDesktopMenuLogoFixed) {
                window.fixMenuLogoPosition();
            }
            if ($('body').hasClass('mobile-cart-position-top')) {
                $('.mobile-cart > .minicart-menu-link.temp').remove();
                $('#primary-navigation .menu-item-cart > *').appendTo('.mobile-cart');
            }
        } else {
            window.thegemWasDesktop = true;
            if (window.gemMobileMenuType == 'overlay' && !$('.header-layout-overlay').length && $('.menu-overlay').hasClass('active')) {
                $('.mobile-menu-layout-overlay .menu-toggle').click();
            }
            $('#primary-navigation').addClass('without-transition');
            if (window.gemMobileMenuType == 'default') {
                $('#primary-navigation .dl-submenu').addClass('dl-submenu-disabled').removeClass('dl-submenu');
            }
            $('#primary-menu').addClass('no-responsive');
            $('#primary-navigation').removeClass('responsive');
            $('.menu-overlay').removeClass('mobile');
            window.fixMenuLogoPosition();
            if (!window.megaMenuWithSettingsFixed) {
                fixMegaMenuWithSettings();
            }
            $('#primary-navigation').removeClass('without-transition');
            if ($('body').hasClass('mobile-cart-position-top')) {
                $('.mobile-cart > .minicart-menu-link.temp').remove();
                $('.mobile-cart > *').appendTo('#primary-navigation .menu-item-cart');
            }
        }
    }
    $(function() {
        function getScrollY(elem) {
            return window.pageYOffset || document.documentElement.scrollTop;
        }
        $(document).on('click', '.mobile-cart > a', function(e) {
            e.preventDefault();
            $('.mobile-cart .minicart').addClass('minicart-show');
            $('body').data('scroll-position', getScrollY())
            $('body').addClass('mobile-minicart-opened');
        });
        $(document).on('click', '.mobile-cart-header-close, .mobile-minicart-overlay', function(e) {
            e.preventDefault();
            $('.mobile-cart .minicart').removeClass('minicart-show');
            $('body').removeClass('mobile-minicart-opened');
            if ($('body').data('scroll-position')) {
                window.scrollTo(0, $('body').data('scroll-position'))
            }
        });
    });
    if (window.gemMobileMenuType == 'default') {
        $('#primary-navigation .submenu-languages').addClass('dl-submenu');
    }
    $('#primary-navigation ul#primary-menu > li.menu-item-language, #primary-navigation ul#primary-menu > li.menu-item-type-wpml_ls_menu_item').addClass('menu-item-parent');
    $('#primary-navigation ul#primary-menu > li.menu-item-language > a, #primary-navigation ul#primary-menu > li.menu-item-type-wpml_ls_menu_item > a').after('<span class="menu-item-parent-toggle"></span>');
    fixMegaMenuWithSettings();
    if (window.gemMobileMenuType == 'default') {
        var updateMobileMenuPosition = function() {
            var siteHeaderHeight = $('#site-header').outerHeight()
              , windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            if ($('#thegem-perspective #primary-menu').length) {
                $('#thegem-perspective > .mobile-menu-layout-default').css({
                    top: siteHeaderHeight
                });
            }
            $('#primary-menu').css({
                maxHeight: windowHeight - siteHeaderHeight
            });
        };
        $(window).resize(function() {
            if (isResponsiveMenuVisible() && $('#primary-menu').hasClass('dl-menuopen')) {
                setTimeout(updateMobileMenuPosition, 50);
            } else {
                $('#primary-menu').css({
                    maxHeight: ''
                });
            }
        });
        $('#site-header .dl-trigger').on('click', function() {
            updateMobileMenuPosition();
        });
        if (typeof $.fn.dlmenu === 'function') {
            $('#primary-navigation').dlmenu({
                animationClasses: {
                    classin: 'dl-animate-in',
                    classout: 'dl-animate-out'
                },
                onLevelClick: function(el, name) {},
                backLabel: thegem_dlmenu_settings.backLabel,
                showCurrentLabel: thegem_dlmenu_settings.showCurrentLabel
            });
        }
    }
    primary_menu_reinit();
    $('#primary-menu > li').hover(function() {
        var $items = $('ul:not(.minicart ul), .minicart, .minisearch', this);
        $items.removeClass('invert vertical-invert');
        if (!$(this).hasClass('megamenu-enable')) {
            $items.css({
                top: ''
            });
        }
        if ($(this).hasClass('megamenu-enable') || $(this).closest('.header-layout-overlay').length || $(this).closest('.mobile-menu-layout-overlay').length && isResponsiveMenuVisible()) {
            return;
        }
        var topItemTranslate = 0;
        if ($('>ul', this).css('transform')) {
            topItemTranslate = parseInt($('>ul', this).css('transform').split(',')[5]);
        }
        if (isNaN(topItemTranslate)) {
            topItemTranslate = 0;
        }
        var windowScroll = $(window).scrollTop()
          , siteHeaderOffset = $('#site-header').offset()
          , siteHeaderOffsetTop = siteHeaderOffset.top - windowScroll
          , siteHeaderHeight = $('#site-header').outerHeight()
          , pageOffset = $('#page').offset()
          , pageWidth = $('#page').width();
        $items.each(function() {
            var $item = $(this)
              , self = this
              , $parentList = $item.parent().closest('ul');
            var itemOffset = $item.offset()
              , itemOffsetTop = itemOffset.top - windowScroll
              , itemOffsetLeft = itemOffset.left;
            var leftItemTranslate = 0;
            if ($item.css('transform')) {
                leftItemTranslate = parseInt(getComputedStyle(this).transform.split(',')[4]);
                var levelUL = getLevelULByPrimaryMenu(self);
                if (levelUL > 0) {
                    leftItemTranslate = leftItemTranslate * levelUL;
                }
            }
            if (isNaN(leftItemTranslate)) {
                leftItemTranslate = 0;
            }
            if ($parentList.hasClass('invert')) {
                if ($parentList.offset().left - $item.outerWidth() > pageOffset.left) {
                    $item.addClass('invert');
                }
            } else {
                if (itemOffsetLeft - leftItemTranslate - pageOffset.left + $item.outerWidth() > pageWidth) {
                    $item.addClass('invert');
                }
            }
            if (isVerticalMenu || isPerspectiveMenu || isHamburgerMenu) {
                if (itemOffsetTop - topItemTranslate + $item.outerHeight() > $(window).height()) {
                    $item.addClass('vertical-invert');
                    var itemOffsetFix = itemOffsetTop - topItemTranslate + $item.outerHeight() - $(window).height();
                    if (itemOffsetTop - topItemTranslate - itemOffsetFix < 0) {
                        itemOffsetFix = 0;
                    }
                    $item.css({
                        top: -itemOffsetFix + 'px'
                    });
                }
            } else {
                if (itemOffsetTop - topItemTranslate + $item.outerHeight() > $(window).height()) {
                    $item.addClass('vertical-invert');
                    var itemOffsetFix = itemOffsetTop - topItemTranslate + $item.outerHeight() - $(window).height();
                    if (itemOffsetTop - topItemTranslate - itemOffsetFix < siteHeaderOffsetTop + siteHeaderHeight) {
                        itemOffsetFix -= siteHeaderOffsetTop + siteHeaderHeight - (itemOffsetTop - topItemTranslate - itemOffsetFix);
                        if (itemOffsetFix < 0) {
                            itemOffsetFix = 0;
                        }
                    }
                    if (itemOffsetFix > 0) {
                        $item.css({
                            top: -itemOffsetFix + 'px'
                        });
                    }
                }
            }
        });
    }, function() {});
    function getLevelULByPrimaryMenu(item) {
        var parentUL = $(item).parent('li').parent('ul');
        var level = 0;
        while (!parentUL.is('#primary-menu')) {
            parentUL = parentUL.parent('li').parent('ul');
            level++;
        }
        return level;
    }
    $('.hamburger-toggle').click(function(e) {
        e.preventDefault();
        $(this).closest('#primary-navigation').toggleClass('hamburger-active');
        $('.hamburger-overlay').toggleClass('active');
    });
    $('.overlay-toggle, .mobile-menu-layout-overlay .menu-toggle').click(function(e) {
        var $element = this;
        e.preventDefault();
        if ($('.menu-overlay').hasClass('active')) {
            $('.menu-overlay').removeClass('active');
            $('.primary-navigation').addClass('close');
            $('.primary-navigation').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
                $('.primary-navigation').removeClass('overlay-active close');
                $('.overlay-menu-wrapper').removeClass('active');
            });
            $(document).off('keydown.overlay-close');
            $('#primary-menu').off('click.overlay-close');
        } else {
            $('.overlay-menu-wrapper').addClass('active');
            $('.primary-navigation').off('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend');
            $('.primary-navigation').addClass('overlay-active').removeClass('close');
            if (isResponsiveMenuVisible()) {
                $('#site-header').removeClass('hidden');
                $('.menu-overlay').addClass('mobile');
            } else {
                $('.menu-overlay').removeClass('mobile');
            }
            $('.menu-overlay').addClass('active');
            $(document).on('keydown.overlay-close', function(event) {
                if (event.keyCode == 27) {
                    $element.click();
                }
            });
            $('#primary-menu').on('click.overlay-close', 'li:not(.menu-item-search)', function() {
                $element.click();
            });
        }
    });
    $('.mobile-menu-layout-slide-horizontal .primary-navigation #primary-menu li.menu-item-current, .mobile-menu-layout-slide-vertical .primary-navigation #primary-menu li.menu-item-current').each(function() {
        if (!isResponsiveMenuVisible()) {
            return;
        }
        $(this).addClass('opened');
        $('> ul', this).show();
    });
    function getScrollY(elem) {
        return window.pageYOffset || document.documentElement.scrollTop;
    }
    $('.mobile-menu-layout-slide-horizontal .menu-toggle, .mobile-menu-layout-slide-vertical .menu-toggle, .mobile-menu-slide-wrapper .mobile-menu-slide-close').click(function(e) {
        if (!isResponsiveMenuVisible()) {
            return;
        }
        e.preventDefault();
        $('#site-header').removeClass('hidden');
        $('.mobile-menu-slide-wrapper').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(e) {
            $(this).removeClass('animation');
        });
        $('.mobile-menu-slide-wrapper').addClass('animation').toggleClass('opened');
        $('#site-header').toggleClass('menu-slide-opened');
        if ($('.mobile-menu-slide-wrapper').hasClass('opened')) {
            $('body').data('scroll-position', getScrollY())
            $('body').addClass('menu-scroll-locked');
        } else {
            $('body').removeClass('menu-scroll-locked');
            if ($('body').data('scroll-position')) {
                window.scrollTo(0, $('body').data('scroll-position'))
            }
        }
        setTimeout(function() {
            $(document).on('click.mobile-menu-out-click', function(e) {
                if ($('.mobile-menu-slide-wrapper').hasClass('opened')) {
                    if (!$(e.target).is('#site-header *') && !$(e.target).is('#thegem-perspective *')) {
                        e.preventDefault();
                        $('.mobile-menu-slide-wrapper .mobile-menu-slide-close').trigger('click');
                        $(document).off('click.mobile-menu-out-click');
                    }
                }
            });
        }, 500);
    });
    $('.mobile-menu-layout-slide-horizontal .primary-navigation #primary-menu .menu-item-parent-toggle, .mobile-menu-layout-slide-vertical .primary-navigation #primary-menu .menu-item-parent-toggle').on('click', function(e) {
        if (!isResponsiveMenuVisible()) {
            return;
        }
        e.preventDefault();
        var self = this;
        $(this).closest('li').toggleClass('opened');
        $(this).siblings('ul').slideToggle(200, function() {
            if (!$(self).closest('li').hasClass('opened')) {
                $(self).siblings('ul').find('li').removeClass('opened');
                $(self).siblings('ul').css('display', '');
                $(self).siblings('ul').find('ul').css('display', '');
            }
        });
    });
    $('.header-layout-overlay #primary-menu .menu-item-parent-toggle, .mobile-menu-layout-overlay .primary-navigation #primary-menu .menu-item-parent-toggle').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (!$('#primary-menu').hasClass('no-responsive') && !$(this).hasClass('menu-item-parent-toggle')) {
            return;
        }
        var $itemLink = $(this);
        var $item = $itemLink.closest('li');
        if ($item.hasClass('menu-item-parent') && ($item.closest('ul').hasClass('nav-menu') || $item.parent().closest('li').hasClass('menu-overlay-item-open'))) {
            e.preventDefault();
            if ($item.hasClass('menu-overlay-item-open')) {
                $(' > ul, .menu-overlay-item-open > ul', $item).each(function() {
                    $(this).css({
                        height: $(this).outerHeight() + 'px'
                    });
                });
                setTimeout(function() {
                    $(' > ul, .menu-overlay-item-open > ul', $item).css({
                        height: ''
                    });
                    $('.menu-overlay-item-open', $item).add($item).removeClass('menu-overlay-item-open');
                }, 50);
            } else {
                var $oldActive = $('.primary-navigation .menu-overlay-item-open').not($item.parents());
                $('> ul', $oldActive).not($item.parents()).each(function() {
                    $(this).css({
                        height: $(this).outerHeight() + 'px'
                    });
                });
                setTimeout(function() {
                    $('> ul', $oldActive).not($item.parents()).css({
                        height: ''
                    });
                    $oldActive.removeClass('menu-overlay-item-open');
                }, 50);
                $('> ul', $item).css({
                    height: 'auto'
                });
                var itemHeight = $('> ul', $item).outerHeight();
                $('> ul', $item).css({
                    height: ''
                });
                setTimeout(function() {
                    $('> ul', $item).css({
                        height: itemHeight + 'px'
                    });
                    $item.addClass('menu-overlay-item-open');
                    $('> ul', $item).one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function() {
                        $('> ul', $item).css({
                            height: 'auto'
                        });
                    });
                }, 50);
            }
        }
    });
    $('.vertical-toggle').click(function(e) {
        e.preventDefault();
        $(this).closest('#site-header-wrapper').toggleClass('vertical-active');
    });
    $(function() {
        $(window).resize(function() {
            if (window.menuResizeTimeoutHandler) {
                clearTimeout(window.menuResizeTimeoutHandler);
            }
            window.menuResizeTimeoutHandler = setTimeout(primary_menu_reinit, 50);
        });
    });
    $('#primary-navigation').on('click', 'a', function(e) {
        var $item = $(this);
        if ($('#primary-menu').hasClass('no-responsive') && window.gemSettings.isTouch && $item.next('ul').length) {
            e.preventDefault();
        }
    });
    $(document).on('click', function(e) {
        if ($('.hamburger-overlay').hasClass('active') && !$(e.target).closest("#primary-menu").length && !$(e.target).closest(".hamburger-toggle").length) {
            $('.hamburger-toggle').trigger('click');
        }
        if ($("#site-header-wrapper").hasClass('vertical-active')) {
            if (!$("#site-header-wrapper").is(e.target) && $("#site-header-wrapper").has(e.target).length === 0) {
                $('.vertical-toggle').trigger('click');
            }
        }
    });
}
)(jQuery);
(function($) {
    var transitionEndEvent = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    }[window.supportedTransition]
      , clickEventName = 'click';
    function initPerspective() {
        var $menuToggleButton = $('.perspective-toggle')
          , $perspective = $('#thegem-perspective')
          , $page = $('#page');
        if (!$perspective.length) {
            return false;
        }
        $menuToggleButton.on(clickEventName, function(event) {
            if ($perspective.hasClass('animate')) {
                return;
            }
            var documentScrollTop = $(window).scrollTop();
            $(window).scrollTop(0);
            var pageWidth = $page.outerWidth()
              , perspectiveWidth = $perspective.outerWidth()
              , pageCss = {
                width: pageWidth
            };
            if (pageWidth < perspectiveWidth) {
                pageCss.marginLeft = $page[0].offsetLeft;
            }
            $page.css(pageCss);
            $perspective.addClass('modalview animate');
            $page.scrollTop(documentScrollTop);
            event.preventDefault();
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
        });
        $('#primary-navigation').on(clickEventName, function(event) {
            if (isResponsiveMenuVisible()) {
                return;
            }
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
        });
        $('#thegem-perspective .perspective-menu-close').on(clickEventName, function(event) {
            $perspective.click();
            event.preventDefault();
            event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
        });
        $perspective.on(clickEventName, function(event) {
            if (!$perspective.hasClass('animate')) {
                return;
            }
            var onEndTransitionCallback = function(event) {
                if (window.supportsTransitions && (event.originalEvent.target.id !== 'page' || event.originalEvent.propertyName.indexOf('transform') == -1)) {
                    return;
                }
                $(this).off(transitionEndEvent, onEndTransitionCallback);
                var pageScrollTop = $page.scrollTop();
                $perspective.removeClass('modalview');
                $page.css({
                    width: '',
                    marginLeft: ''
                });
                $(window).scrollTop(pageScrollTop);
                $page.scrollTop(0);
                $(window).resize();
            };
            if (window.supportsTransitions) {
                $perspective.on(transitionEndEvent, onEndTransitionCallback);
            } else {
                onEndTransitionCallback.call();
            }
            $perspective.removeClass('animate');
        });
    }
    initPerspective();
}
)(jQuery);
;(function(document, navigator, CACHE, IE9TO11) {
    if (IE9TO11)
        document.addEventListener('DOMContentLoaded', function() {
            [].forEach.call(document.querySelectorAll('use'), function(use) {
                var svg = use.parentNode
                  , url = use.getAttribute('xlink:href').split('#')
                  , url_root = url[0]
                  , url_hash = url[1]
                  , xhr = CACHE[url_root] = CACHE[url_root] || new XMLHttpRequest();
                if (!xhr.s) {
                    xhr.s = [];
                    xhr.open('GET', url_root);
                    xhr.onload = function() {
                        var x = document.createElement('x')
                          , s = xhr.s;
                        x.innerHTML = xhr.responseText;
                        xhr.onload = function() {
                            s.splice(0).map(function(array) {
                                var g = x.querySelector('#' + array[2]);
                                if (g)
                                    array[0].replaceChild(g.cloneNode(true), array[1]);
                            });
                        }
                        ;
                        xhr.onload();
                    }
                    ;
                    xhr.send();
                }
                xhr.s.push([svg, use, url_hash]);
                if (xhr.responseText)
                    xhr.onload();
            });
        });
}
)(document, navigator, {}, /Trident\/[567]\b/.test(navigator.userAgent));
;(function($) {
    $.fn.checkbox = function() {
        $(this).each(function() {
            var $el = $(this);
            var typeClass = $el.attr('type');
            $el.hide();
            $el.next('.' + typeClass + '-sign').remove();
            var $checkbox = $('<span class="' + typeClass + '-sign" />').insertAfter($el);
            $checkbox.click(function() {
                if ($checkbox.closest('label').length)
                    return;
                if ($el.attr('type') == 'radio') {
                    $el.prop('checked', true).trigger('change').trigger('click');
                } else {
                    $el.prop('checked', !($el.is(':checked'))).trigger('change');
                }
            });
            $el.change(function() {
                $('input[name="' + $el.attr('name') + '"]').each(function() {
                    if ($(this).is(':checked')) {
                        $(this).next('.' + $(this).attr('type') + '-sign').addClass('checked');
                    } else {
                        $(this).next('.' + $(this).attr('type') + '-sign').removeClass('checked');
                    }
                });
            });
            if ($el.is(':checked')) {
                $checkbox.addClass('checked');
            } else {
                $checkbox.removeClass('checked');
            }
        });
    }
    $.fn.combobox = function() {
        $(this).each(function() {
            var $el = $(this);
            $el.insertBefore($el.parent('.combobox-wrapper'));
            $el.next('.combobox-wrapper').remove();
            $el.css({
                'opacity': 0,
                'position': 'absolute',
                'left': 0,
                'right': 0,
                'top': 0,
                'bottom': 0
            });
            var $comboWrap = $('<span class="combobox-wrapper" />').insertAfter($el);
            var $text = $('<span class="combobox-text" />').appendTo($comboWrap);
            var $button = $('<span class="combobox-button" />').appendTo($comboWrap);
            $el.appendTo($comboWrap);
            $el.change(function() {
                $text.text($('option:selected', $el).text());
            });
            $text.text($('option:selected', $el).text());
            $el.comboWrap = $comboWrap;
        });
    }
}
)(jQuery);
;jQuery.easing['jswing'] = jQuery.easing['swing'];
jQuery.extend(jQuery.easing, {
    def: 'easeOutQuad',
    swing: function(x, t, b, c, d) {
        return jQuery.easing[jQuery.easing.def](x, t, b, c, d);
    },
    easeInQuad: function(x, t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    easeOutQuad: function(x, t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    easeInOutQuad: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t + b;
        return -c / 2 * ((--t) * (t - 2) - 1) + b;
    },
    easeInCubic: function(x, t, b, c, d) {
        return c * (t /= d) * t * t + b;
    },
    easeOutCubic: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t + 1) + b;
    },
    easeInOutCubic: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t + 2) + b;
    },
    easeInQuart: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t + b;
    },
    easeOutQuart: function(x, t, b, c, d) {
        return -c * ((t = t / d - 1) * t * t * t - 1) + b;
    },
    easeInOutQuart: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t + b;
        return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
    },
    easeInQuint: function(x, t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    easeOutQuint: function(x, t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    easeInOutQuint: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return c / 2 * t * t * t * t * t + b;
        return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
    },
    easeInSine: function(x, t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    },
    easeOutSine: function(x, t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    },
    easeInOutSine: function(x, t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    },
    easeInExpo: function(x, t, b, c, d) {
        return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
    },
    easeOutExpo: function(x, t, b, c, d) {
        return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
    },
    easeInOutExpo: function(x, t, b, c, d) {
        if (t == 0)
            return b;
        if (t == d)
            return b + c;
        if ((t /= d / 2) < 1)
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
        return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    },
    easeInCirc: function(x, t, b, c, d) {
        return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
    },
    easeOutCirc: function(x, t, b, c, d) {
        return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
    },
    easeInOutCirc: function(x, t, b, c, d) {
        if ((t /= d / 2) < 1)
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
    },
    easeInElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else
            var s = p / (2 * Math.PI) * Math.asin(c / a);
        return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
    },
    easeOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d) == 1)
            return b + c;
        if (!p)
            p = d * .3;
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else
            var s = p / (2 * Math.PI) * Math.asin(c / a);
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
    },
    easeInOutElastic: function(x, t, b, c, d) {
        var s = 1.70158;
        var p = 0;
        var a = c;
        if (t == 0)
            return b;
        if ((t /= d / 2) == 2)
            return b + c;
        if (!p)
            p = d * (.3 * 1.5);
        if (a < Math.abs(c)) {
            a = c;
            var s = p / 4;
        } else
            var s = p / (2 * Math.PI) * Math.asin(c / a);
        if (t < 1)
            return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
    },
    easeInBack: function(x, t, b, c, d, s) {
        if (s == undefined)
            s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    easeOutBack: function(x, t, b, c, d, s) {
        if (s == undefined)
            s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    easeInOutBack: function(x, t, b, c, d, s) {
        if (s == undefined)
            s = 1.70158;
        if ((t /= d / 2) < 1)
            return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
        return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
    },
    easeInBounce: function(x, t, b, c, d) {
        return c - jQuery.easing.easeOutBounce(x, d - t, 0, c, d) + b;
    },
    easeOutBounce: function(x, t, b, c, d) {
        if ((t /= d) < (1 / 2.75)) {
            return c * (7.5625 * t * t) + b;
        } else if (t < (2 / 2.75)) {
            return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
        } else if (t < (2.5 / 2.75)) {
            return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
        } else {
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
        }
    },
    easeInOutBounce: function(x, t, b, c, d) {
        if (t < d / 2)
            return jQuery.easing.easeInBounce(x, t * 2, 0, c, d) * .5 + b;
        return jQuery.easing.easeOutBounce(x, t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }
});
;(function($) {
    function HeaderAnimation(el, options) {
        this.el = el;
        this.$el = $(el);
        this.options = {
            startTop: 1
        };
        $.extend(this.options, options);
        this.initialize();
    }
    HeaderAnimation.prototype = {
        initialize: function() {
            var self = this;
            this.$page = $('#page').length ? $('#page') : $('body');
            this.$wrapper = $('#site-header-wrapper');
            this.$topArea = $('#top-area');
            this.topAreaInSiteHeader = $('#site-header #top-area').length > 0;
            this.$headerMain = $('.header-main', this.$el);
            this.hasAdminBar = document.body.className.indexOf('admin-bar') != -1;
            this.adminBarOffset = 0;
            this.adminBarHeight = 0;
            this.topOffset = 0;
            this.oldScrollY = 0;
            this.isResponsive = null;
            this.isResponsiveOld = null;
            this.hideWrapper = this.$wrapper.hasClass('site-header-wrapper-transparent');
            this.videoBackground = $('.page-title-block .gem-video-background').length && $('.page-title-block .gem-video-background').data('headerup');
            if (this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
                this.$wrapper.css({
                    position: 'absolute'
                });
            }
            if (this.$el.hasClass('header-on-slideshow') && $('#main-content > *').first().is('.gem-slideshow, .block-slideshow')) {
                this.$wrapper.addClass('header-on-slideshow');
            } else {
                this.$el.removeClass('header-on-slideshow');
            }
            if (this.videoBackground) {
                this.$el.addClass('header-on-slideshow');
                this.$wrapper.addClass('header-on-slideshow');
            }
            this.initHeader();
            $(document).ready(function() {
                self.updateAdminBarInfo();
                self.updateStartTop();
            });
            $(window).scroll(function() {
                self.scrollHandler();
            });
            if ($('#thegem-perspective').length) {
                this.$page.scroll(function() {
                    self.scrollHandler();
                });
            }
            $(window).resize(function() {
                setTimeout(function() {
                    self.initHeader();
                    self.scrollHandler();
                }, 0);
            });
            $(window).on("load", function() {
                self.$el.addClass('ios-load');
            });
        },
        initHeader: function() {
            this.isResponsiveOld = this.isResponsive;
            this.isResponsive = window.isResponsiveMenuVisible();
            if (this.isResponsive) {
                this.$el.addClass('shrink-mobile');
            } else {
                this.$el.removeClass('shrink-mobile');
            }
            this.updateAdminBarInfo();
            this.updateStartTop();
            if (this.isResponsive != this.isResponsiveOld) {
                this.initializeStyles();
            }
        },
        updateAdminBarInfo: function() {
            if (this.hasAdminBar) {
                this.adminBarHeight = $('#wpadminbar').outerHeight();
                this.adminBarOffset = this.hasAdminBar && $('#wpadminbar').css('position') == 'fixed' ? parseInt(this.adminBarHeight) : 0;
            }
        },
        updateStartTop: function() {
            if (this.$topArea.length && this.$topArea.is(':visible') && !this.topAreaInSiteHeader) {
                this.options.startTop = this.$topArea.outerHeight();
            } else {
                this.options.startTop = 1;
            }
            if (this.hasAdminBar && this.adminBarOffset == 0) {
                this.options.startTop += this.adminBarHeight;
            }
        },
        setMargin: function($img) {
            var $small = $img.siblings('img.small')
              , w = 0;
            if (this.$headerMain.hasClass('logo-position-right')) {
                w = $small.width();
            } else if (this.$headerMain.hasClass('logo-position-center') || this.$headerMain.hasClass('logo-position-menu_center')) {
                w = $img.width();
                var smallWidth = $small.width()
                  , offset = (w - smallWidth) / 2;
                w = smallWidth + offset;
                $small.css('margin-right', offset + 'px');
            }
            if (!w) {
                w = $img.width();
            }
            $small.css('margin-left', '-' + w + 'px');
            $img.parent().css('min-width', w + 'px');
            $small.show();
        },
        initializeStyles: function() {
            var self = this;
            if (this.$headerMain.hasClass('logo-position-menu_center')) {
                var $img = $('#primary-navigation .menu-item-logo a .logo img.default', this.$el);
            } else {
                var $img = $('.site-title .site-logo a .logo img', this.$el);
            }
            if ($img.length && $img[0].complete) {
                self.setMargin($img);
                self.initializeHeight();
            } else {
                $img.on('load error', function() {
                    self.setMargin($img);
                    self.initializeHeight();
                });
            }
        },
        initializeHeight: function() {
            if (this.hideWrapper) {
                return false;
            }
            that = this;
            setTimeout(function() {
                var shrink = that.$el.hasClass('shrink');
                if (shrink) {
                    that.$el.removeClass('shrink').addClass('without-transition');
                }
                var elHeight = that.$el.outerHeight();
                if (navigator.userAgent.match(/(iPod|iPhone|iPad)/)) {
                    that.$wrapper.css('min-height', elHeight);
                } else {
                    that.$wrapper.height(elHeight);
                }
                if (shrink) {
                    that.$el.addClass('shrink').removeClass('without-transition');
                }
            }, 50);
        },
        scrollHandler: function() {
            if (window.gemSettings.fullpageEnabled) {
                return;
            }
            var self = this
              , scrollY = this.getScrollY();
            if (scrollY >= this.options.startTop) {
                if (!this.$el.hasClass('shrink')) {
                    var shrinkClass = 'shrink fixed';
                    if (window.gemSettings.fillTopArea) {
                        shrinkClass += ' fill';
                    }
                    this.$el.addClass(shrinkClass);
                }
                var top = 0;
                if (this.$page[0].scrollTop > 0) {
                    top += this.$page[0].scrollTop;
                } else {
                    if (this.hasAdminBar) {
                        top += this.adminBarOffset;
                    }
                }
                this.$el.css({
                    top: top != 0 ? top : ''
                });
            } else {
                if (this.$el.hasClass('shrink')) {
                    this.$el.removeClass('shrink fixed');
                }
                if (this.hasAdminBar) {
                    this.$el.css({
                        top: ''
                    });
                }
            }
            if (this.isResponsive && !this.$wrapper.hasClass('sticky-header-on-mobile')) {
                if (!$('.mobile-menu-slide-wrapper.opened').length && !$('#primary-menu.dl-menuopen').length && !$('.menu-overlay.active').length) {
                    if (scrollY - this.oldScrollY > 0 && scrollY > 300 && !this.$el.hasClass('hidden')) {
                        self.$el.addClass('hidden');
                    }
                    if (scrollY - this.oldScrollY < 0 && this.$el.hasClass('hidden')) {
                        self.$el.removeClass('hidden');
                    }
                } else {
                    self.$el.removeClass('hidden');
                }
            }
            this.oldScrollY = scrollY;
        },
        getScrollY: function() {
            return window.pageYOffset || document.documentElement.scrollTop + this.$page[0].scrollTop;
        },
    };
    $.fn.headerAnimation = function(options) {
        options = options || {};
        return new HeaderAnimation(this.get(0),options);
    }
    ;
}
)(jQuery);
;(function() {
    var defaultOptions = {
        frameRate: 150,
        animationTime: 400,
        stepSize: 100,
        pulseAlgorithm: true,
        pulseScale: 4,
        pulseNormalize: 1,
        accelerationDelta: 50,
        accelerationMax: 3,
        keyboardSupport: true,
        arrowScroll: 50,
        fixedBackground: true,
        excluded: ''
    };
    var options = defaultOptions;
    var isExcluded = false;
    var isFrame = false;
    var direction = {
        x: 0,
        y: 0
    };
    var initDone = false;
    var root = document.documentElement;
    var activeElement;
    var observer;
    var refreshSize;
    var deltaBuffer = [];
    var deltaBufferTimer;
    var isMac = /^Mac/.test(navigator.platform);
    var key = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        spacebar: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36
    };
    var arrowKeys = {
        37: 1,
        38: 1,
        39: 1,
        40: 1
    };
    function initTest() {
        if (options.keyboardSupport) {
            addEvent('keydown', keydown);
        }
    }
    function init() {
        if (initDone || !document.body)
            return;
        initDone = true;
        var body = document.body;
        var html = document.documentElement;
        var windowHeight = window.innerHeight;
        var scrollHeight = body.scrollHeight;
        root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
        activeElement = body;
        initTest();
        if (top != self) {
            isFrame = true;
        } else if (isOldSafari && scrollHeight > windowHeight && (body.offsetHeight <= windowHeight || html.offsetHeight <= windowHeight)) {
            var fullPageElem = document.createElement('div');
            fullPageElem.style.cssText = 'position:absolute; z-index:-10000; ' + 'top:0; left:0; right:0; height:' + root.scrollHeight + 'px';
            document.body.appendChild(fullPageElem);
            var pendingRefresh;
            refreshSize = function() {
                if (pendingRefresh)
                    return;
                pendingRefresh = setTimeout(function() {
                    if (isExcluded)
                        return;
                    fullPageElem.style.height = '0';
                    fullPageElem.style.height = root.scrollHeight + 'px';
                    pendingRefresh = null;
                }, 500);
            }
            ;
            setTimeout(refreshSize, 10);
            addEvent('resize', refreshSize);
            var config = {
                attributes: true,
                childList: true,
                characterData: false
            };
            observer = new MutationObserver(refreshSize);
            observer.observe(body, config);
            if (root.offsetHeight <= windowHeight) {
                var clearfix = document.createElement('div');
                clearfix.style.clear = 'both';
                body.appendChild(clearfix);
            }
        }
        if (!options.fixedBackground && !isExcluded) {
            body.style.backgroundAttachment = 'scroll';
            html.style.backgroundAttachment = 'scroll';
        }
    }
    function cleanup() {
        observer && observer.disconnect();
        removeEvent(wheelEvent, wheel);
        removeEvent('mousedown', mousedown);
        removeEvent('keydown', keydown);
        removeEvent('resize', refreshSize);
        removeEvent('load', init);
    }
    var que = [];
    var pending = false;
    var lastScroll = Date.now();
    function scrollArray(elem, left, top) {
        directionCheck(left, top);
        if (options.accelerationMax != 1) {
            var now = Date.now();
            var elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                var factor = (1 + (50 / elapsed)) / 2;
                if (factor > 1) {
                    factor = Math.min(factor, options.accelerationMax);
                    left *= factor;
                    top *= factor;
                }
            }
            lastScroll = Date.now();
        }
        que.push({
            x: left,
            y: top,
            lastX: (left < 0) ? 0.99 : -0.99,
            lastY: (top < 0) ? 0.99 : -0.99,
            start: Date.now()
        });
        if (pending) {
            return;
        }
        var scrollRoot = getScrollRoot();
        var isWindowScroll = (elem === scrollRoot || elem === document.body);
        if (elem.$scrollBehavior == null && isScrollBehaviorSmooth(elem)) {
            elem.$scrollBehavior = elem.style.scrollBehavior;
            elem.style.scrollBehavior = 'auto';
        }
        var step = function(time) {
            var now = Date.now();
            var scrollX = 0;
            var scrollY = 0;
            for (var i = 0; i < que.length; i++) {
                var item = que[i];
                var elapsed = now - item.start;
                var finished = (elapsed >= options.animationTime);
                var position = (finished) ? 1 : elapsed / options.animationTime;
                if (options.pulseAlgorithm) {
                    position = pulse(position);
                }
                var x = (item.x * position - item.lastX) >> 0;
                var y = (item.y * position - item.lastY) >> 0;
                scrollX += x;
                scrollY += y;
                item.lastX += x;
                item.lastY += y;
                if (finished) {
                    que.splice(i, 1);
                    i--;
                }
            }
            if (isWindowScroll) {
                window.scrollBy(scrollX, scrollY);
            } else {
                if (scrollX)
                    elem.scrollLeft += scrollX;
                if (scrollY)
                    elem.scrollTop += scrollY;
            }
            if (!left && !top) {
                que = [];
            }
            if (que.length) {
                requestFrame(step, elem, (1000 / options.frameRate + 1));
            } else {
                pending = false;
                if (elem.$scrollBehavior != null) {
                    elem.style.scrollBehavior = elem.$scrollBehavior;
                    elem.$scrollBehavior = null;
                }
            }
        };
        requestFrame(step, elem, 0);
        pending = true;
    }
    function wheel(event) {
        if (!initDone) {
            init();
        }
        var target = event.target;
        if (event.defaultPrevented || event.ctrlKey) {
            return true;
        }
        if (isNodeName(activeElement, 'embed') || (isNodeName(target, 'embed') && /\.pdf/i.test(target.src)) || isNodeName(activeElement, 'object') || target.shadowRoot) {
            return true;
        }
        var deltaX = -event.wheelDeltaX || event.deltaX || 0;
        var deltaY = -event.wheelDeltaY || event.deltaY || 0;
        if (isMac) {
            if (event.wheelDeltaX && isDivisible(event.wheelDeltaX, 120)) {
                deltaX = -120 * (event.wheelDeltaX / Math.abs(event.wheelDeltaX));
            }
            if (event.wheelDeltaY && isDivisible(event.wheelDeltaY, 120)) {
                deltaY = -120 * (event.wheelDeltaY / Math.abs(event.wheelDeltaY));
            }
        }
        if (!deltaX && !deltaY) {
            deltaY = -event.wheelDelta || 0;
        }
        if (event.deltaMode === 1) {
            deltaX *= 40;
            deltaY *= 40;
        }
        var overflowing = overflowingAncestor(target);
        if (!overflowing) {
            if (isFrame && isChrome) {
                Object.defineProperty(event, "target", {
                    value: window.frameElement
                });
                return parent.wheel(event);
            }
            return true;
        }
        if (isTouchpad(deltaY)) {
            return true;
        }
        if (Math.abs(deltaX) > 1.2) {
            deltaX *= options.stepSize / 120;
        }
        if (Math.abs(deltaY) > 1.2) {
            deltaY *= options.stepSize / 120;
        }
        scrollArray(overflowing, deltaX, deltaY);
        event.preventDefault();
        scheduleClearCache();
    }
    function keydown(event) {
        var target = event.target;
        var modifier = event.ctrlKey || event.altKey || event.metaKey || (event.shiftKey && event.keyCode !== key.spacebar);
        if (!document.body.contains(activeElement)) {
            activeElement = document.activeElement;
        }
        var inputNodeNames = /^(textarea|select|embed|object)$/i;
        var buttonTypes = /^(button|submit|radio|checkbox|file|color|image)$/i;
        if (event.defaultPrevented || inputNodeNames.test(target.nodeName) || isNodeName(target, 'input') && !buttonTypes.test(target.type) || isNodeName(activeElement, 'video') || isInsideYoutubeVideo(event) || target.isContentEditable || modifier) {
            return true;
        }
        if ((isNodeName(target, 'button') || isNodeName(target, 'input') && buttonTypes.test(target.type)) && event.keyCode === key.spacebar) {
            return true;
        }
        if (isNodeName(target, 'input') && target.type == 'radio' && arrowKeys[event.keyCode]) {
            return true;
        }
        var shift, x = 0, y = 0;
        var overflowing = overflowingAncestor(activeElement);
        if (!overflowing) {
            return (isFrame && isChrome) ? parent.keydown(event) : true;
        }
        var clientHeight = overflowing.clientHeight;
        if (overflowing == document.body) {
            clientHeight = window.innerHeight;
        }
        switch (event.keyCode) {
        case key.up:
            y = -options.arrowScroll;
            break;
        case key.down:
            y = options.arrowScroll;
            break;
        case key.spacebar:
            shift = event.shiftKey ? 1 : -1;
            y = -shift * clientHeight * 0.9;
            break;
        case key.pageup:
            y = -clientHeight * 0.9;
            break;
        case key.pagedown:
            y = clientHeight * 0.9;
            break;
        case key.home:
            if (overflowing == document.body && document.scrollingElement)
                overflowing = document.scrollingElement;
            y = -overflowing.scrollTop;
            break;
        case key.end:
            var scroll = overflowing.scrollHeight - overflowing.scrollTop;
            var scrollRemaining = scroll - clientHeight;
            y = (scrollRemaining > 0) ? scrollRemaining + 10 : 0;
            break;
        case key.left:
            x = -options.arrowScroll;
            break;
        case key.right:
            x = options.arrowScroll;
            break;
        default:
            return true;
        }
        scrollArray(overflowing, x, y);
        event.preventDefault();
        scheduleClearCache();
    }
    function mousedown(event) {
        activeElement = event.target;
    }
    var uniqueID = (function() {
        var i = 0;
        return function(el) {
            return el.uniqueID || (el.uniqueID = i++);
        }
        ;
    }
    )();
    var cacheX = {};
    var cacheY = {};
    var clearCacheTimer;
    var smoothBehaviorForElement = {};
    function scheduleClearCache() {
        clearTimeout(clearCacheTimer);
        clearCacheTimer = setInterval(function() {
            cacheX = cacheY = smoothBehaviorForElement = {};
        }, 1 * 1000);
    }
    function setCache(elems, overflowing, x) {
        var cache = x ? cacheX : cacheY;
        for (var i = elems.length; i--; )
            cache[uniqueID(elems[i])] = overflowing;
        return overflowing;
    }
    function getCache(el, x) {
        return (x ? cacheX : cacheY)[uniqueID(el)];
    }
    function overflowingAncestor(el) {
        var elems = [];
        var body = document.body;
        var rootScrollHeight = root.scrollHeight;
        do {
            var cached = getCache(el, false);
            if (cached) {
                return setCache(elems, cached);
            }
            elems.push(el);
            if (rootScrollHeight === el.scrollHeight) {
                var topOverflowsNotHidden = overflowNotHidden(root) && overflowNotHidden(body);
                var isOverflowCSS = topOverflowsNotHidden || overflowAutoOrScroll(root);
                if (isFrame && isContentOverflowing(root) || !isFrame && isOverflowCSS) {
                    return setCache(elems, getScrollRoot());
                }
            } else if (isContentOverflowing(el) && overflowAutoOrScroll(el)) {
                return setCache(elems, el);
            }
        } while ((el = el.parentElement));
    }
    function isContentOverflowing(el) {
        return (el.clientHeight + 10 < el.scrollHeight);
    }
    function overflowNotHidden(el) {
        var overflow = getComputedStyle(el, '').getPropertyValue('overflow-y');
        return (overflow !== 'hidden');
    }
    function overflowAutoOrScroll(el) {
        var overflow = getComputedStyle(el, '').getPropertyValue('overflow-y');
        return (overflow === 'scroll' || overflow === 'auto');
    }
    function isScrollBehaviorSmooth(el) {
        var id = uniqueID(el);
        if (smoothBehaviorForElement[id] == null) {
            var scrollBehavior = getComputedStyle(el, '')['scroll-behavior'];
            smoothBehaviorForElement[id] = ('smooth' == scrollBehavior);
        }
        return smoothBehaviorForElement[id];
    }
    function addEvent(type, fn, arg) {
        window.addEventListener(type, fn, arg || false);
    }
    function removeEvent(type, fn, arg) {
        window.removeEventListener(type, fn, arg || false);
    }
    function isNodeName(el, tag) {
        return el && (el.nodeName || '').toLowerCase() === tag.toLowerCase();
    }
    function directionCheck(x, y) {
        x = (x > 0) ? 1 : -1;
        y = (y > 0) ? 1 : -1;
        if (direction.x !== x || direction.y !== y) {
            direction.x = x;
            direction.y = y;
            que = [];
            lastScroll = 0;
        }
    }
    if (window.localStorage && localStorage.SS_deltaBuffer) {
        try {
            deltaBuffer = localStorage.SS_deltaBuffer.split(',');
        } catch (e) {}
    }
    function isTouchpad(deltaY) {
        if (!deltaY)
            return;
        if (!deltaBuffer.length) {
            deltaBuffer = [deltaY, deltaY, deltaY];
        }
        deltaY = Math.abs(deltaY);
        deltaBuffer.push(deltaY);
        deltaBuffer.shift();
        clearTimeout(deltaBufferTimer);
        deltaBufferTimer = setTimeout(function() {
            try {
                localStorage.SS_deltaBuffer = deltaBuffer.join(',');
            } catch (e) {}
        }, 1000);
        var dpiScaledWheelDelta = deltaY > 120 && allDeltasDivisableBy(deltaY);
        return !allDeltasDivisableBy(120) && !allDeltasDivisableBy(100) && !dpiScaledWheelDelta;
    }
    function isDivisible(n, divisor) {
        return (Math.floor(n / divisor) == n / divisor);
    }
    function allDeltasDivisableBy(divisor) {
        return (isDivisible(deltaBuffer[0], divisor) && isDivisible(deltaBuffer[1], divisor) && isDivisible(deltaBuffer[2], divisor));
    }
    function isInsideYoutubeVideo(event) {
        var elem = event.target;
        var isControl = false;
        if (document.URL.indexOf('www.youtube.com/watch') != -1) {
            do {
                isControl = (elem.classList && elem.classList.contains('html5-video-controls'));
                if (isControl)
                    break;
            } while ((elem = elem.parentNode));
        }
        return isControl;
    }
    var requestFrame = (function() {
        return (window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback, element, delay) {
            window.setTimeout(callback, delay || (1000 / 60));
        }
        );
    }
    )();
    var MutationObserver = (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver);
    var getScrollRoot = (function() {
        var SCROLL_ROOT = document.scrollingElement;
        return function() {
            if (!SCROLL_ROOT) {
                var dummy = document.createElement('div');
                dummy.style.cssText = 'height:10000px;width:1px;';
                document.body.appendChild(dummy);
                var bodyScrollTop = document.body.scrollTop;
                var docElScrollTop = document.documentElement.scrollTop;
                window.scrollBy(0, 3);
                if (document.body.scrollTop != bodyScrollTop)
                    (SCROLL_ROOT = document.body);
                else
                    (SCROLL_ROOT = document.documentElement);
                window.scrollBy(0, -3);
                document.body.removeChild(dummy);
            }
            return SCROLL_ROOT;
        }
        ;
    }
    )();
    function pulse_(x) {
        var val, start, expx;
        x = x * options.pulseScale;
        if (x < 1) {
            val = x - (1 - Math.exp(-x));
        } else {
            start = Math.exp(-1);
            x -= 1;
            expx = 1 - Math.exp(-x);
            val = start + (expx * (1 - start));
        }
        return val * options.pulseNormalize;
    }
    function pulse(x) {
        if (x >= 1)
            return 1;
        if (x <= 0)
            return 0;
        if (options.pulseNormalize == 1) {
            options.pulseNormalize /= pulse_(1);
        }
        return pulse_(x);
    }
    var userAgent = window.navigator.userAgent;
    var isEdge = /Edge/.test(userAgent);
    var isChrome = /chrome/i.test(userAgent) && !isEdge;
    var isSafari = /safari/i.test(userAgent) && !isEdge;
    var isMobile = /mobile/i.test(userAgent);
    var isIEWin7 = /Windows NT 6.1/i.test(userAgent) && /rv:11/i.test(userAgent);
    var isOldSafari = isSafari && (/Version\/8/i.test(userAgent) || /Version\/9/i.test(userAgent));
    var isEnabledForBrowser = (isChrome || isSafari || isIEWin7) && !isMobile;
    var supportsPassive = false;
    try {
        window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function() {
                supportsPassive = true;
            }
        }));
    } catch (e) {}
    var wheelOpt = supportsPassive ? {
        passive: false
    } : false;
    var wheelEvent = 'onwheel'in document.createElement('div') ? 'wheel' : 'mousewheel';
    if (wheelEvent && isEnabledForBrowser) {
        addEvent(wheelEvent, wheel, wheelOpt);
        addEvent('mousedown', mousedown);
        addEvent('load', init);
    }
    function SmoothScroll(optionsToSet) {
        for (var key in optionsToSet)
            if (defaultOptions.hasOwnProperty(key))
                options[key] = optionsToSet[key];
    }
    SmoothScroll.destroy = cleanup;
    if (window.SmoothScrollOptions)
        SmoothScroll(window.SmoothScrollOptions);
    if (typeof define === 'function' && define.amd)
        define(function() {
            return SmoothScroll;
        });
    else if ('object' == typeof exports)
        module.exports = SmoothScroll;
    else
        window.SmoothScroll = SmoothScroll;
}
)();
;(function($) {
    $.fn.thegemPreloader = function(callback) {
        $(this).each(function() {
            var $el = $(this)
              , hasSrc = ['img', 'iframe'].indexOf($el[0].nodeName.toLowerCase()) != -1;
            $el.data('thegemPreloader', $('img, iframe', $el).add($el.filter('img, iframe')).length);
            if ($el.data('thegemPreloader') == 0 || (hasSrc && !$el.attr('src'))) {
                $el.prev('.preloader').remove();
                callback();
                $el.trigger('thegem-preloader-loaded');
                return;
            }
            if (!$el.prev('.preloader').length) {
                $('<div class="preloader">').insertBefore($el);
            }
            $('img, iframe', $el).add($el.filter('img, iframe')).each(function() {
                function preloaderItemLoaded() {
                    $el.data('thegemPreloader', $el.data('thegemPreloader') - 1);
                    if ($el.data('thegemPreloader') == 0) {
                        $el.prev('.preloader').remove();
                        callback();
                        $el.trigger('thegem-preloader-loaded');
                    }
                }
                if (!$(this).attr('src')) {
                    preloaderItemLoaded();
                    return;
                }
                var $obj = $('<img>');
                if ($(this).prop('tagName').toLowerCase() == 'iframe') {
                    $obj = $(this);
                }
                $obj.attr('src', $(this).attr('src'));
                $obj.on('load error', preloaderItemLoaded);
            });
        });
    }
}
)(jQuery);
(function($) {
    var oWidth = $.fn.width;
    $.fn.width = function(argument) {
        if (arguments.length == 0 && this.length == 1 && this[0] === window) {
            if (window.gemOptions.innerWidth != -1) {
                return window.gemOptions.innerWidth;
            }
            var width = oWidth.apply(this, arguments);
            window.updateGemInnerSize(width);
            return width;
        }
        return oWidth.apply(this, arguments);
    }
    ;
    var $page = $('#page');
    $(window).load(function() {
        var $preloader = $('#page-preloader');
        if ($preloader.length && !$preloader.hasClass('preloader-loaded')) {
            $preloader.addClass('preloader-loaded');
        }
    });
    $('#site-header.animated-header').headerAnimation();
    $.fn.updateTabs = function() {
        jQuery('.gem-tabs', this).each(function(index) {
            var $tabs = $(this);
            $tabs.thegemPreloader(function() {
                $tabs.easyResponsiveTabs({
                    type: 'default',
                    width: 'auto',
                    fit: false,
                    activate: function(currentTab, e) {
                        var $tab = $(currentTab.target);
                        var controls = $tab.attr('aria-controls');
                        $tab.closest('.ui-tabs').find('.gem_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
                    }
                });
            });
        });
        jQuery('.gem-tour', this).each(function(index) {
            var $tabs = $(this);
            $tabs.thegemPreloader(function() {
                $tabs.easyResponsiveTabs({
                    type: 'vertical',
                    width: 'auto',
                    fit: false,
                    activate: function(currentTab, e) {
                        var $tab = $(currentTab.target);
                        var controls = $tab.attr('aria-controls');
                        $tab.closest('.ui-tabs').find('.gem_tab[aria-labelledby="' + controls + '"]').trigger('tab-update');
                    }
                });
            });
        });
    }
    ;
    function fullwidth_block_after_update($item) {
        $item.trigger('updateTestimonialsCarousel');
        $item.trigger('updateClientsCarousel');
        $item.trigger('fullwidthUpdate');
    }
    function fullwidth_block_update($item, pageOffset, pagePaddingLeft, pageWidth, skipTrigger) {
        var $prevElement = $item.prev()
          , extra_padding = 0;
        if ($prevElement.length == 0 || $prevElement.hasClass('fullwidth-block')) {
            $prevElement = $item.parent();
            extra_padding = parseInt($prevElement.css('padding-left'));
        }
        var offsetKey = window.gemSettings.isRTL ? 'right' : 'left';
        var cssData = {
            width: pageWidth
        };
        cssData[offsetKey] = pageOffset.left - ($prevElement.length ? $prevElement.offset().left : 0) + parseInt(pagePaddingLeft) - extra_padding;
        $item.css(cssData);
        if (!skipTrigger) {
            fullwidth_block_after_update($item);
        }
    }
    var inlineFullwidths = []
      , notInlineFullwidths = [];
    $('.fullwidth-block').each(function() {
        var $item = $(this)
          , $parents = $item.parents('.vc_row')
          , fullw = {
            isInline: false
        };
        $parents.each(function() {
            if (this.hasAttribute('data-vc-full-width')) {
                fullw.isInline = true;
                return false;
            }
        });
        if (fullw.isInline) {
            inlineFullwidths.push(this);
        } else {
            notInlineFullwidths.push(this);
        }
    });
    function update_fullwidths(inline, init) {
        var $needUpdate = [];
        (inline ? inlineFullwidths : notInlineFullwidths).forEach(function(item) {
            $needUpdate.push(item);
        });
        if ($needUpdate.length > 0) {
            var pageOffset = $page.offset()
              , pagePaddingLeft = $page.css('padding-left')
              , pageWidth = $page.width();
            $needUpdate.forEach(function(item) {
                fullwidth_block_update($(item), pageOffset, pagePaddingLeft, pageWidth);
            });
        }
    }
    if (!window.disableGemSlideshowPreloaderHandle) {
        jQuery('.gem-slideshow').each(function() {
            var $slideshow = $(this);
            $slideshow.thegemPreloader(function() {});
        });
    }
    $(function() {
        $('#gem-icons-loading-hide').remove();
        if (window.tgpLazyItems === undefined) {
            $('#thegem-preloader-inline-css').remove();
        }
        jQuery('iframe').not('.gem-video-background iframe, .wcppec-checkout-buttons iframe').each(function() {
            $(this).thegemPreloader(function() {});
        });
        jQuery('.gem-video-background').each(function() {
            var $videoBG = $(this);
            var $videoContainer = $('.gem-video-background-inner', this);
            var ratio = $videoBG.data('aspect-ratio') ? $videoBG.data('aspect-ratio') : '16:9';
            var regexp = /(\d+):(\d+)/;
            var $fullwidth = $videoBG.closest('.fullwidth-block');
            ratio = regexp.exec(ratio);
            if (!ratio || parseInt(ratio[1]) == 0 || parseInt(ratio[2]) == 0) {
                ratio = 16 / 9;
            } else {
                ratio = parseInt(ratio[1]) / parseInt(ratio[2]);
            }
            function gemVideoUpdate() {
                $videoContainer.removeAttr('style');
                if ($videoContainer.width() / $videoContainer.height() > ratio) {
                    $videoContainer.css({
                        height: ($videoContainer.width() / ratio) + 'px',
                        marginTop: -($videoContainer.width() / ratio - $videoBG.height()) / 2 + 'px'
                    });
                } else {
                    $videoContainer.css({
                        width: ($videoContainer.height() * ratio) + 'px',
                        marginLeft: -($videoContainer.height() * ratio - $videoBG.width()) / 2 + 'px'
                    });
                }
            }
            if ($videoBG.closest('.page-title-block').length > 0) {
                gemVideoUpdate();
            }
            if ($fullwidth.length) {
                $fullwidth.on('fullwidthUpdate', gemVideoUpdate);
            } else {
                $(window).resize(gemVideoUpdate);
            }
        });
        update_fullwidths(false, true);
        $('.fullwidth-block').each(function() {
            var $item = $(this)
              , mobile_enabled = $item.data('mobile-parallax-enable') || '0'
              , is_custom_title = $item.hasClass('custom-title-background');
            if (!window.gemSettings.isTouch || mobile_enabled == '1') {
                if ($item.hasClass('fullwidth-block-parallax-vertical')) {
                    var parallaxOptions = {};
                    if (is_custom_title) {
                        parallaxOptions.position = 'top';
                    }
                    $('.fullwidth-block-background', $item).each(function() {
                        var backgroundImageCss = $(this).css('background-image') || '';
                        if (backgroundImageCss == 'none' || backgroundImageCss == '') {
                            $(this).on('tgpliVisible', function() {
                                $(this).parallaxVertical('50%', parallaxOptions);
                            });
                            return;
                        }
                        $(this).parallaxVertical('50%', parallaxOptions);
                    });
                } else if ($item.hasClass('fullwidth-block-parallax-horizontal')) {
                    $('.fullwidth-block-background', $item).each(function() {
                        if (!window.gemSettings.parallaxDisabled) {
                            var backgroundImageCss = $(this).css('background-image') || '';
                            if (backgroundImageCss == 'none' || backgroundImageCss == '') {
                                $(this).on('tgpliVisible', function() {
                                    $(this).parallaxHorizontal();
                                });
                                return;
                            }
                            $(this).parallaxHorizontal();
                        }
                    });
                }
            } else {
                $('.fullwidth-block-background', $item).css({
                    backgroundAttachment: 'scroll'
                });
            }
        });
        if (!window.gemSettings.isTouch) {
            $('.page-title-parallax-background').each(function() {
                var backgroundImageCss = $(this).css('background-image') || '';
                if (backgroundImageCss == 'none' || backgroundImageCss == '') {
                    $(this).on('tgpliVisible', function() {
                        $(this).parallaxVertical('50%', {
                            position: 'top'
                        });
                    });
                    return;
                }
                $(this).parallaxVertical('50%', {
                    position: 'top'
                });
            });
        } else {
            $('.page-title-parallax-background').css({
                backgroundAttachment: 'scroll'
            });
        }
        $(window).resize(function() {
            update_fullwidths(false, false);
        });
        $(window).load(function() {
            update_fullwidths(false, false);
        });
        jQuery('select.gem-combobox, .gem-combobox select, .widget_archive select').each(function(index) {
            $(this).combobox();
        });
        jQuery('.widget_categories select').each(function() {
            this.onchange = null;
            $(this).on('change', function() {
                if ($(this).val() != -1) {
                    $(this).closest('form').submit();
                }
            });
        });
        jQuery('input.gem-checkbox, .gem-checkbox input').checkbox();
        if (typeof ($.fn.ReStable) == "function") {
            jQuery('.gem-table-responsive').each(function(index) {
                $('> table', this).ReStable({
                    maxWidth: 768,
                    rowHeaders: $(this).hasClass('row-headers')
                });
            });
        }
        jQuery('.fancybox').each(function() {
            $(this).fancybox();
        });
        if (typeof jQuery.fn.scSticky === 'function') {
            jQuery('.panel-sidebar-sticky > .sidebar').scSticky();
        }
        jQuery('iframe + .map-locker').each(function() {
            var $locker = $(this);
            $locker.click(function(e) {
                e.preventDefault();
                if ($locker.hasClass('disabled')) {
                    $locker.prev('iframe').css({
                        'pointer-events': 'none'
                    });
                } else {
                    $locker.prev('iframe').css({
                        'pointer-events': 'auto'
                    });
                }
                $locker.toggleClass('disabled');
            });
        });
        $('.primary-navigation a.mega-no-link').closest('li').removeClass('menu-item-active current-menu-item');
        function getElementPagePosition(element) {
            var width = element.offsetWidth
              , height = element.offsetHeight
              , left = 0
              , top = 0;
            while (element && element.id != 'page') {
                left += element.offsetLeft;
                top += element.offsetTop;
                element = element.offsetParent;
            }
            return {
                "left": left,
                "top": top,
                "width": width,
                "height": height
            };
        }
        var $anhorsElements = [];
        $('.quickfinder-item a, .primary-navigation a, .gem-button, .footer-navigation a, .scroll-top-button, .scroll-to-anchor, .scroll-to-anchor a, .top-area-menu a').each(function(e) {
            var $anhor = $(this);
            var link = $anhor.attr('href');
            if (!link)
                return;
            link = link.split('#');
            if ($('#' + link[1]).hasClass('vc_tta-panel'))
                return;
            if ($('#' + link[1]).length) {
                $anhor.closest('li').removeClass('menu-item-active current-menu-item');
                $anhor.closest('li').parents('li').removeClass('menu-item-current');
                $(document).on('update-page-scroller', function(e, elem) {
                    var $elem = $(elem);
                    if (!$anhor.closest('li.menu-item').length)
                        return;
                    if ($elem.is($('#' + link[1])) || $elem.find($('#' + link[1])).length) {
                        $anhor.closest('li').addClass('menu-item-active');
                        $anhor.closest('li').parents('li').addClass('menu-item-current');
                    } else {
                        $anhor.closest('li').removeClass('menu-item-active');
                        $anhor.closest('li').parents('li.menu-item-current').each(function() {
                            if (!$('.menu-item-active', this).length) {
                                $(this).removeClass('menu-item-current');
                            }
                        });
                    }
                });
                $anhor.click(function(e) {
                    e.preventDefault();
                    history.replaceState('data to be passed', $anhor.text(), $anhor.attr('href'));
                    var correction = 0;
                    var isPerspectiveMenu = $('#thegem-perspective.modalview').length;
                    if ($('#site-header.animated-header').length) {
                        var shrink = $('#site-header').hasClass('shrink');
                        $('#site-header').addClass('scroll-counting');
                        $('#site-header').addClass('fixed shrink');
                        correction = $('#site-header').outerHeight();
                        if (!isPerspectiveMenu) {
                            var siteHeaderTop = $('#site-header').position().top;
                            if ($('#site-header').hasClass('shrink')) {
                                siteHeaderTop = 0;
                            }
                            correction += siteHeaderTop;
                        }
                        if (!shrink) {
                            $('#site-header').removeClass('fixed shrink');
                        }
                        setTimeout(function() {
                            $('#site-header').removeClass('scroll-counting');
                        }, 50);
                    }
                    var target_top = getElementPagePosition($('#' + link[1])[0]).top - correction + 1;
                    if (getElementPagePosition($('#' + link[1])[0]).top == 0) {
                        target_top = 0;
                    }
                    if ($('body').hasClass('page-scroller') && $('.page-scroller-nav-pane').is(':visible')) {
                        var $block = $('#' + link[1] + '.scroller-block').add($('#' + link[1]).closest('.scroller-block')).eq(0);
                        if ($block.length) {
                            $('.page-scroller-nav-pane .page-scroller-nav-item').eq($('.scroller-block').index($block)).trigger('click');
                        }
                        if ($anhor.closest('.overlay-menu-wrapper').length && $anhor.closest('.overlay-menu-wrapper').hasClass('active')) {
                            if ($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('responsive')) {
                                $('.menu-toggle').trigger('click');
                            } else {
                                $('.overlay-toggle').trigger('click');
                            }
                        }
                    } else {
                        if (isPerspectiveMenu) {
                            $('#page').stop(true, true).animate({
                                scrollTop: target_top
                            }, 1500, 'easeInOutCubic', function() {
                                if ($anhor.closest('#thegem-perspective').length && $anhor.closest('#thegem-perspective').hasClass('modalview')) {
                                    $('.perspective-menu-close').trigger('click');
                                }
                            });
                        } else {
                            $('html, body').stop(true, true).animate({
                                scrollTop: target_top
                            }, 1500, 'easeInOutCubic');
                        }
                        if ($anhor.closest('#primary-menu').length && $anhor.closest('#primary-menu').hasClass('dl-menuopen')) {
                            $('.menu-toggle').trigger('click');
                        }
                        if ($anhor.closest('.mobile-menu-slide-wrapper').length && $anhor.closest('.mobile-menu-slide-wrapper').hasClass('opened')) {
                            $('.mobile-menu-slide-close').trigger('click');
                        }
                        if ($anhor.closest('.overlay-menu-wrapper').length && $anhor.closest('.overlay-menu-wrapper').hasClass('active')) {
                            if ($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('responsive')) {
                                $('.menu-toggle').trigger('click');
                            } else {
                                $('.overlay-toggle').trigger('click');
                            }
                        }
                        if ($anhor.closest('#primary-navigation').length && $anhor.closest('#primary-navigation').hasClass('hamburger-active')) {
                            $('.hamburger-toggle').trigger('click');
                        }
                    }
                });
                $anhorsElements.push($anhor[0]);
            }
        });
        if ($anhorsElements.length) {
            function anchorLinksScroll() {
                var isPerspectiveMenu = $('#thegem-perspective.modalview').length;
                var correction = 0;
                if (!$page.hasClass('vertical-header')) {
                    correction = $('#site-header').outerHeight();
                    if (!isPerspectiveMenu) {
                        var siteHeaderTop = $('#site-header').length ? $('#site-header').position().top : 0;
                        if ($('#site-header').hasClass('shrink')) {
                            siteHeaderTop = 0;
                        }
                        correction += siteHeaderTop;
                    }
                }
                for (var i = 0; i < $anhorsElements.length; i++) {
                    var $anhor = $($anhorsElements[i]);
                    var link = $anhor.attr('href');
                    if (!link)
                        continue;
                    link = link.split('#');
                    var scrollY = getScrollY() + $page.scrollTop();
                    if (!$anhor.closest('li.menu-item').length)
                        continue;
                    var target_top = getElementPagePosition($('#' + link[1])[0]).top - correction;
                    if (scrollY >= target_top && scrollY <= target_top + $('#' + link[1]).outerHeight()) {
                        $anhor.closest('li').addClass('menu-item-active');
                        $anhor.closest('li').parents('li').addClass('menu-item-current');
                    } else {
                        $anhor.closest('li').removeClass('menu-item-active');
                        $anhor.closest('li').parents('li.menu-item-current').each(function() {
                            if (!$('.menu-item-active', this).length) {
                                $(this).removeClass('menu-item-current');
                            }
                        });
                    }
                }
            }
            $(window).scroll(anchorLinksScroll);
            if ($('#thegem-perspective').length) {
                $page.scroll(anchorLinksScroll);
            }
            $(window).load(function() {
                for (var i = 0; i < $anhorsElements.length; i++) {
                    var anhor = $anhorsElements[i];
                    if (anhor.href != undefined && anhor.href && window.location.href == anhor.href) {
                        anhor.click();
                        break;
                    }
                }
            });
        }
        $('body').on('click', '.post-footer-sharing .gem-button', function(e) {
            e.preventDefault();
            $(this).closest('.post-footer-sharing').find('.sharing-popup').toggleClass('active');
        });
        var scrollTimer, body = document.body;
        $(window).scroll(function() {
            clearTimeout(scrollTimer);
            if (!body.classList.contains('disable-hover')) {}
            scrollTimer = setTimeout(function() {}, 300);
            if (getScrollY() > 0) {
                $('.scroll-top-button').addClass('visible');
            } else {
                $('.scroll-top-button').removeClass('visible');
            }
        }).scroll();
        function getScrollY(elem) {
            return window.pageYOffset || document.documentElement.scrollTop;
        }
        $('a.hidden-email').each(function() {
            $(this).attr('href', 'mailto:' + $(this).data('name') + '@' + $(this).data('domain'));
        });
        var initFooterWidgetArea = function() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initFooterWidgetArea.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var self = this;
            $(self).thegemPreloader(function() {
                $(self).isotope({
                    itemSelector: '.widget',
                    layoutMode: 'masonry'
                });
            });
        };
        $('#colophon .footer-widget-area').each(initFooterWidgetArea);
        $('body').updateTabs();
    });
    $(document).on('show.vc.accordion', '[data-vc-accordion]', function() {
        var $target = $(this).data('vc.accordion').getContainer();
        var correction = 0;
        if (!$target.find('.vc_tta-tabs').length || !$(this).is(':visible') || $target.data('vc-tta-autoplay'))
            return;
        if ($('#site-header.animated-header').length && $('#site-header').hasClass('fixed')) {
            var shrink = $('#site-header').hasClass('shrink');
            $('#site-header').addClass('scroll-counting');
            $('#site-header').addClass('fixed shrink');
            correction = $('#site-header').outerHeight() + $('#site-header').position().top;
            if (!shrink) {
                $('#site-header').removeClass('fixed shrink');
            }
            $('#site-header').removeClass('scroll-counting');
        }
        var target_top = $target.offset().top - correction - 100 + 1;
        $('html, body').stop(true, true).animate({
            scrollTop: target_top
        }, 500, 'easeInOutCubic');
    });
    var vc_update_fullwidth_init = true;
    $(document).on('vc-full-width-row', function(e) {
        if (window.gemOptions.clientWidth - $page.width() > 25 || window.gemSettings.isRTL) {
            for (var i = 1; i < arguments.length; i++) {
                var $el = $(arguments[i]);
                $el.addClass("vc_hidden");
                var $el_full = $el.next(".vc_row-full-width");
                $el_full.length || ($el_full = $el.parent().next(".vc_row-full-width"));
                var el_margin_left = parseInt($el.css("margin-left"), 10)
                  , el_margin_right = parseInt($el.css("margin-right"), 10)
                  , offset = 0 - $el_full.offset().left - el_margin_left + $('#page').offset().left + parseInt($('#page').css('padding-left'))
                  , width = $('#page').width();
                var offsetKey = window.gemSettings.isRTL ? 'right' : 'left';
                var cssData = {
                    position: "relative",
                    left: offset,
                    "box-sizing": "border-box",
                    width: $("#page").width()
                };
                cssData[offsetKey] = offset;
                if ($el.css(cssData),
                !$el.data("vcStretchContent")) {
                    var padding = -1 * offset;
                    0 > padding && (padding = 0);
                    var paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right;
                    0 > paddingRight && (paddingRight = 0),
                    $el.css({
                        "padding-left": padding + "px",
                        "padding-right": paddingRight + "px"
                    })
                }
                $el.attr("data-vc-full-width-init", "true"),
                $el.removeClass("vc_hidden");
                $el.trigger('VCRowFullwidthUpdate');
            }
        }
        update_fullwidths(true, vc_update_fullwidth_init);
        vc_update_fullwidth_init = false;
    });
    $('body').on('click', '.gem-button[href^="#give-form-"]', function(e) {
        var form_id = $(this).attr('href').replace('#give-form-', '');
        form_id = parseInt(form_id);
        if (!isNaN(form_id)) {
            $('#give-form-' + form_id + ' .give-btn-modal').click();
        }
        e.preventDefault();
        return false;
    });
}
)(jQuery);
(function($) {
    $('.menu-item-search a').on('click', function(e) {
        e.preventDefault();
        if ($(this).closest('.overlay-menu-wrapper.active').length) {
            var $primaryMenu = $('#primary-menu');
            $primaryMenu.addClass('overlay-search-form-show');
            if ($primaryMenu.hasClass('no-responsive')) {
                $primaryMenu.addClass('animated-minisearch');
            }
            setTimeout(function() {
                $(document).on('click.menu-item-search-close', 'body', function(e) {
                    if (!$(e.target).is('.menu-item-search .minisearch *')) {
                        var $primaryMenu = $('#primary-menu');
                        if ($primaryMenu.hasClass('animated-minisearch')) {
                            $primaryMenu.removeClass('animated-minisearch');
                            setTimeout(function() {
                                $primaryMenu.removeClass('overlay-search-form-show');
                                $(document).off('click.menu-item-search-close');
                            }, 700);
                        } else {
                            $primaryMenu.removeClass('overlay-search-form-show');
                            $(document).off('click.menu-item-search-close');
                        }
                    }
                });
            }, 500);
        } else {
            $('.menu-item-search').toggleClass('active');
        }
    });
}
)(jQuery);
(function($) {
    $('.menu-item-search a').click(function() {
        if (!$('#primary-navigation').hasClass('overlay-active')) {
            $('#searchform-input').focus();
        }
    });
}
)(jQuery);
;/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */
(function(d) {
    function e(a) {
        var b = a || window.event
          , c = [].slice.call(arguments, 1)
          , f = 0
          , e = 0
          , g = 0
          , a = d.event.fix(b);
        a.type = "mousewheel";
        b.wheelDelta && (f = b.wheelDelta / 120);
        b.detail && (f = -b.detail / 3);
        g = f;
        b.axis !== void 0 && b.axis === b.HORIZONTAL_AXIS && (g = 0,
        e = -1 * f);
        b.wheelDeltaY !== void 0 && (g = b.wheelDeltaY / 120);
        b.wheelDeltaX !== void 0 && (e = -1 * b.wheelDeltaX / 120);
        c.unshift(a, f, e, g);
        return (d.event.dispatch || d.event.handle).apply(this, c)
    }
    var c = ["DOMMouseScroll", "mousewheel"];
    if (d.event.fixHooks)
        for (var h = c.length; h; )
            d.event.fixHooks[c[--h]] = d.event.mouseHooks;
    d.event.special.mousewheel = {
        setup: function() {
            if (this.addEventListener)
                for (var a = c.length; a; )
                    this.addEventListener(c[--a], e, false);
            else
                this.onmousewheel = e
        },
        teardown: function() {
            if (this.removeEventListener)
                for (var a = c.length; a; )
                    this.removeEventListener(c[--a], e, false);
            else
                this.onmousewheel = null
        }
    };
    d.fn.extend({
        mousewheel: function(a) {
            return a ? this.bind("mousewheel", a) : this.trigger("mousewheel")
        },
        unmousewheel: function(a) {
            return this.unbind("mousewheel", a)
        }
    })
}
)(jQuery);
;// ==================================================
// fancyBox v3.1.20
//
// Licensed GPLv3 for open source use
// or fancyBox Commercial License for commercial use
//
// http://fancyapps.com/fancybox/
// Copyright 2017 fancyApps
//
// ==================================================
!function(t, e, n, o) {
    "use strict";
    function i(t) {
        var e = t.currentTarget
          , o = t.data ? t.data.options : {}
          , i = t.data ? t.data.items : []
          , a = n(e).attr("data-fancybox") || ""
          , s = 0;
        t.preventDefault(),
        t.stopPropagation(),
        a ? (i = i.length ? i.filter('[data-fancybox="' + a + '"]') : n('[data-fancybox="' + a + '"]'),
        s = i.index(e),
        s < 0 && (s = 0)) : i = [e],
        n.fancybox.open(i, o, s)
    }
    if (n) {
        if (n.fn.fancybox)
            return void n.error("fancyBox already initialized");
        var a = {
            loop: !1,
            margin: [44, 0],
            gutter: 50,
            keyboard: !0,
            arrows: !0,
            infobar: !1,
            toolbar: !0,
            buttons: ["slideShow", "fullScreen", "thumbs", "close"],
            idleTime: 4,
            smallBtn: "auto",
            protect: !1,
            modal: !1,
            image: {
                preload: "auto"
            },
            ajax: {
                settings: {
                    data: {
                        fancybox: !0
                    }
                }
            },
            iframe: {
                tpl: '<iframe id="fancybox-frame{rnd}" name="fancybox-frame{rnd}" class="fancybox-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen allowtransparency="true" src=""></iframe>',
                preload: !0,
                css: {},
                attr: {
                    scrolling: "auto"
                }
            },
            animationEffect: "zoom",
            animationDuration: 366,
            zoomOpacity: "auto",
            transitionEffect: "fade",
            transitionDuration: 366,
            slideClass: "",
            baseClass: "",
            baseTpl: '<div class="fancybox-container" role="dialog" tabindex="-1"><div class="fancybox-bg"></div><div class="fancybox-inner"><div class="fancybox-infobar"><button data-fancybox-prev title="{{PREV}}" class="fancybox-button fancybox-button--left"></button><div class="fancybox-infobar__body"><span data-fancybox-index></span>&nbsp;/&nbsp;<span data-fancybox-count></span></div><button data-fancybox-next title="{{NEXT}}" class="fancybox-button fancybox-button--right"></button></div><div class="fancybox-toolbar">{{BUTTONS}}</div><div class="fancybox-navigation"><button data-fancybox-prev title="{{PREV}}" class="fancybox-arrow fancybox-arrow--left" /><button data-fancybox-next title="{{NEXT}}" class="fancybox-arrow fancybox-arrow--right" /></div><div class="fancybox-stage"></div><div class="fancybox-caption-wrap"><div class="fancybox-caption"></div></div></div></div>',
            spinnerTpl: '<div class="fancybox-loading"></div>',
            errorTpl: '<div class="fancybox-error"><p>{{ERROR}}<p></div>',
            btnTpl: {
                slideShow: '<button data-fancybox-play class="fancybox-button fancybox-button--play" title="{{PLAY_START}}"></button>',
                fullScreen: '<button data-fancybox-fullscreen class="fancybox-button fancybox-button--fullscreen" title="{{FULL_SCREEN}}"></button>',
                thumbs: '<button data-fancybox-thumbs class="fancybox-button fancybox-button--thumbs" title="{{THUMBS}}"></button>',
                close: '<button data-fancybox-close class="fancybox-button fancybox-button--close" title="{{CLOSE}}"></button>',
                smallBtn: '<button data-fancybox-close class="fancybox-close-small" title="{{CLOSE}}"></button>'
            },
            parentEl: "body",
            autoFocus: !0,
            backFocus: !0,
            trapFocus: !0,
            fullScreen: {
                autoStart: !1
            },
            touch: {
                vertical: !0,
                momentum: !0
            },
            hash: null,
            media: {},
            slideShow: {
                autoStart: !1,
                speed: 4e3
            },
            thumbs: {
                autoStart: !1,
                hideOnClose: !0
            },
            onInit: n.noop,
            beforeLoad: n.noop,
            afterLoad: n.noop,
            beforeShow: n.noop,
            afterShow: n.noop,
            beforeClose: n.noop,
            afterClose: n.noop,
            onActivate: n.noop,
            onDeactivate: n.noop,
            clickContent: function(t, e) {
                return "image" === t.type && "zoom"
            },
            clickSlide: "close",
            clickOutside: "close",
            dblclickContent: !1,
            dblclickSlide: !1,
            dblclickOutside: !1,
            mobile: {
                clickContent: function(t, e) {
                    return "image" === t.type && "toggleControls"
                },
                clickSlide: function(t, e) {
                    return "image" === t.type ? "toggleControls" : "close"
                },
                dblclickContent: function(t, e) {
                    return "image" === t.type && "zoom"
                },
                dblclickSlide: function(t, e) {
                    return "image" === t.type && "zoom"
                }
            },
            lang: "en",
            i18n: {
                en: {
                    CLOSE: "Close",
                    NEXT: "Next",
                    PREV: "Previous",
                    ERROR: "The requested content cannot be loaded. <br/> Please try again later.",
                    PLAY_START: "Start slideshow",
                    PLAY_STOP: "Pause slideshow",
                    FULL_SCREEN: "Full screen",
                    THUMBS: "Thumbnails"
                },
                de: {
                    CLOSE: "Schliessen",
                    NEXT: "Weiter",
                    PREV: "Zurück",
                    ERROR: "Die angeforderten Daten konnten nicht geladen werden. <br/> Bitte versuchen Sie es später nochmal.",
                    PLAY_START: "Diaschau starten",
                    PLAY_STOP: "Diaschau beenden",
                    FULL_SCREEN: "Vollbild",
                    THUMBS: "Vorschaubilder"
                }
            }
        }
          , s = n(t)
          , r = n(e)
          , c = 0
          , l = function(t) {
            return t && t.hasOwnProperty && t instanceof n
        }
          , u = function() {
            return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function(e) {
                return t.setTimeout(e, 1e3 / 60)
            }
        }()
          , d = function() {
            var t, n = e.createElement("fakeelement"), i = {
                transition: "transitionend",
                OTransition: "oTransitionEnd",
                MozTransition: "transitionend",
                WebkitTransition: "webkitTransitionEnd"
            };
            for (t in i)
                if (n.style[t] !== o)
                    return i[t]
        }()
          , f = function(t) {
            return t && t.length && t[0].offsetHeight
        }
          , h = function(t, o, i) {
            var s = this;
            s.opts = n.extend(!0, {
                index: i
            }, a, o || {}),
            o && n.isArray(o.buttons) && (s.opts.buttons = o.buttons),
            s.id = s.opts.id || ++c,
            s.group = [],
            s.currIndex = parseInt(s.opts.index, 10) || 0,
            s.prevIndex = null,
            s.prevPos = null,
            s.currPos = 0,
            s.firstRun = null,
            s.createGroup(t),
            s.group.length && (s.$lastFocus = n(e.activeElement).blur(),
            s.slides = {},
            s.init(t))
        };
        n.extend(h.prototype, {
            init: function() {
                var t, e, o, i = this, a = i.group[i.currIndex].opts;
                i.scrollTop = r.scrollTop(),
                i.scrollLeft = r.scrollLeft(),
                n.fancybox.getInstance() || n.fancybox.isMobile || "hidden" === n("body").css("overflow") || (t = n("body").width(),
                n("html").addClass("fancybox-enabled"),
                t = n("body").width() - t,
                t > 1 && n("head").append('<style id="fancybox-style-noscroll" type="text/css">.compensate-for-scrollbar, .fancybox-enabled body { margin-right: ' + t + "px; }</style>")),
                o = "",
                n.each(a.buttons, function(t, e) {
                    o += a.btnTpl[e] || ""
                }),
                e = n(i.translate(i, a.baseTpl.replace("{{BUTTONS}}", o))).addClass("fancybox-is-hidden").attr("id", "fancybox-container-" + i.id).addClass(a.baseClass).data("FancyBox", i).prependTo(a.parentEl),
                i.$refs = {
                    container: e
                },
                ["bg", "inner", "infobar", "toolbar", "stage", "caption"].forEach(function(t) {
                    i.$refs[t] = e.find(".fancybox-" + t)
                }),
                (!a.arrows || i.group.length < 2) && e.find(".fancybox-navigation").remove(),
                a.infobar || i.$refs.infobar.remove(),
                a.toolbar || i.$refs.toolbar.remove(),
                i.trigger("onInit"),
                i.activate(),
                i.jumpTo(i.currIndex)
            },
            translate: function(t, e) {
                var n = t.opts.i18n[t.opts.lang];
                return e.replace(/\{\{(\w+)\}\}/g, function(t, e) {
                    var i = n[e];
                    return i === o ? t : i
                })
            },
            createGroup: function(t) {
                var e = this
                  , i = n.makeArray(t);
                n.each(i, function(t, i) {
                    var a, s, r, c, l = {}, u = {}, d = [];
                    n.isPlainObject(i) ? (l = i,
                    u = i.opts || i) : "object" === n.type(i) && n(i).length ? (a = n(i),
                    d = a.data(),
                    u = "options"in d ? d.options : {},
                    u = "object" === n.type(u) ? u : {},
                    l.src = "src"in d ? d.src : u.src || a.attr("href"),
                    ["width", "height", "thumb", "type", "filter"].forEach(function(t) {
                        t in d && (u[t] = d[t])
                    }),
                    "srcset"in d && (u.image = {
                        srcset: d.srcset
                    }),
                    u.$orig = a,
                    l.type || l.src || (l.type = "inline",
                    l.src = i)) : l = {
                        type: "html",
                        src: i + ""
                    },
                    l.opts = n.extend(!0, {}, e.opts, u),
                    n.fancybox.isMobile && (l.opts = n.extend(!0, {}, l.opts, l.opts.mobile)),
                    s = l.type || l.opts.type,
                    r = l.src || "",
                    !s && r && (r.match(/(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i) ? s = "image" : r.match(/\.(pdf)((\?|#).*)?$/i) ? s = "pdf" : "#" === r.charAt(0) && (s = "inline")),
                    l.type = s,
                    l.index = e.group.length,
                    l.opts.$orig && !l.opts.$orig.length && delete l.opts.$orig,
                    !l.opts.$thumb && l.opts.$orig && (l.opts.$thumb = l.opts.$orig.find("img:first")),
                    l.opts.$thumb && !l.opts.$thumb.length && delete l.opts.$thumb,
                    "function" === n.type(l.opts.caption) ? l.opts.caption = l.opts.caption.apply(i, [e, l]) : "caption"in d && (l.opts.caption = d.caption),
                    l.opts.caption = l.opts.caption === o ? "" : l.opts.caption + "",
                    "ajax" === s && (c = r.split(/\s+/, 2),
                    c.length > 1 && (l.src = c.shift(),
                    l.opts.filter = c.shift())),
                    "auto" == l.opts.smallBtn && (n.inArray(s, ["html", "inline", "ajax"]) > -1 ? (l.opts.toolbar = !1,
                    l.opts.smallBtn = !0) : l.opts.smallBtn = !1),
                    "pdf" === s && (l.type = "iframe",
                    l.opts.iframe.preload = !1),
                    l.opts.modal && (l.opts = n.extend(!0, l.opts, {
                        infobar: 0,
                        toolbar: 0,
                        smallBtn: 0,
                        keyboard: 0,
                        slideShow: 0,
                        fullScreen: 0,
                        thumbs: 0,
                        touch: 0,
                        clickContent: !1,
                        clickSlide: !1,
                        clickOutside: !1,
                        dblclickContent: !1,
                        dblclickSlide: !1,
                        dblclickOutside: !1
                    })),
                    e.group.push(l)
                })
            },
            addEvents: function() {
                var o = this;
                o.removeEvents(),
                o.$refs.container.on("click.fb-close", "[data-fancybox-close]", function(t) {
                    t.stopPropagation(),
                    t.preventDefault(),
                    o.close(t)
                }).on("click.fb-prev touchend.fb-prev", "[data-fancybox-prev]", function(t) {
                    t.stopPropagation(),
                    t.preventDefault(),
                    o.previous()
                }).on("click.fb-next touchend.fb-next", "[data-fancybox-next]", function(t) {
                    t.stopPropagation(),
                    t.preventDefault(),
                    o.next()
                }),
                s.on("orientationchange.fb resize.fb", function(t) {
                    t && t.originalEvent && "resize" === t.originalEvent.type ? u(function() {
                        o.update()
                    }) : (o.$refs.stage.hide(),
                    setTimeout(function() {
                        o.$refs.stage.show(),
                        o.update()
                    }, 500))
                }),
                r.on("focusin.fb", function(t) {
                    var i = n.fancybox ? n.fancybox.getInstance() : null;
                    i.isClosing || !i.current || !i.current.opts.trapFocus || n(t.target).hasClass("fancybox-container") || n(t.target).is(e) || i && "fixed" !== n(t.target).css("position") && !i.$refs.container.has(t.target).length && (t.stopPropagation(),
                    i.focus(),
                    s.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft))
                }),
                r.on("keydown.fb", function(t) {
                    var e = o.current
                      , i = t.keyCode || t.which;
                    if (e && e.opts.keyboard && !n(t.target).is("input") && !n(t.target).is("textarea"))
                        return 8 === i || 27 === i ? (t.preventDefault(),
                        void o.close(t)) : 37 === i || 38 === i ? (t.preventDefault(),
                        void o.previous()) : 39 === i || 40 === i ? (t.preventDefault(),
                        void o.next()) : void o.trigger("afterKeydown", t, i)
                }),
                o.group[o.currIndex].opts.idleTime && (o.idleSecondsCounter = 0,
                r.on("mousemove.fb-idle mouseenter.fb-idle mouseleave.fb-idle mousedown.fb-idle touchstart.fb-idle touchmove.fb-idle scroll.fb-idle keydown.fb-idle", function() {
                    o.idleSecondsCounter = 0,
                    o.isIdle && o.showControls(),
                    o.isIdle = !1
                }),
                o.idleInterval = t.setInterval(function() {
                    o.idleSecondsCounter++,
                    o.idleSecondsCounter >= o.group[o.currIndex].opts.idleTime && (o.isIdle = !0,
                    o.idleSecondsCounter = 0,
                    o.hideControls())
                }, 1e3))
            },
            removeEvents: function() {
                var e = this;
                s.off("orientationchange.fb resize.fb"),
                r.off("focusin.fb keydown.fb .fb-idle"),
                this.$refs.container.off(".fb-close .fb-prev .fb-next"),
                e.idleInterval && (t.clearInterval(e.idleInterval),
                e.idleInterval = null)
            },
            previous: function(t) {
                return this.jumpTo(this.currPos - 1, t)
            },
            next: function(t) {
                return this.jumpTo(this.currPos + 1, t)
            },
            jumpTo: function(t, e, i) {
                var a, s, r, c, l, u, d, h = this, p = h.group.length;
                if (!(h.isSliding || h.isClosing || h.isAnimating && h.firstRun)) {
                    if (t = parseInt(t, 10),
                    s = h.current ? h.current.opts.loop : h.opts.loop,
                    !s && (t < 0 || t >= p))
                        return !1;
                    if (a = h.firstRun = null === h.firstRun,
                    !(p < 2 && !a && h.isSliding)) {
                        if (c = h.current,
                        h.prevIndex = h.currIndex,
                        h.prevPos = h.currPos,
                        r = h.createSlide(t),
                        p > 1 && ((s || r.index > 0) && h.createSlide(t - 1),
                        (s || r.index < p - 1) && h.createSlide(t + 1)),
                        h.current = r,
                        h.currIndex = r.index,
                        h.currPos = r.pos,
                        h.trigger("beforeShow", a),
                        h.updateControls(),
                        u = n.fancybox.getTranslate(r.$slide),
                        r.isMoved = (0 !== u.left || 0 !== u.top) && !r.$slide.hasClass("fancybox-animated"),
                        r.forcedDuration = o,
                        n.isNumeric(e) ? r.forcedDuration = e : e = r.opts[a ? "animationDuration" : "transitionDuration"],
                        e = parseInt(e, 10),
                        a)
                            return r.opts.animationEffect && e && h.$refs.container.css("transition-duration", e + "ms"),
                            h.$refs.container.removeClass("fancybox-is-hidden"),
                            f(h.$refs.container),
                            h.$refs.container.addClass("fancybox-is-open"),
                            r.$slide.addClass("fancybox-slide--current"),
                            h.loadSlide(r),
                            void h.preload();
                        n.each(h.slides, function(t, e) {
                            n.fancybox.stop(e.$slide)
                        }),
                        r.$slide.removeClass("fancybox-slide--next fancybox-slide--previous").addClass("fancybox-slide--current"),
                        r.isMoved ? (l = Math.round(r.$slide.width()),
                        n.each(h.slides, function(t, o) {
                            var i = o.pos - r.pos;
                            n.fancybox.animate(o.$slide, {
                                top: 0,
                                left: i * l + i * o.opts.gutter
                            }, e, function() {
                                o.$slide.removeAttr("style").removeClass("fancybox-slide--next fancybox-slide--previous"),
                                o.pos === h.currPos && (r.isMoved = !1,
                                h.complete())
                            })
                        })) : h.$refs.stage.children().removeAttr("style"),
                        r.isLoaded ? h.revealContent(r) : h.loadSlide(r),
                        h.preload(),
                        c.pos !== r.pos && (d = "fancybox-slide--" + (c.pos > r.pos ? "next" : "previous"),
                        c.$slide.removeClass("fancybox-slide--complete fancybox-slide--current fancybox-slide--next fancybox-slide--previous"),
                        c.isComplete = !1,
                        e && (r.isMoved || r.opts.transitionEffect) && (r.isMoved ? c.$slide.addClass(d) : (d = "fancybox-animated " + d + " fancybox-fx-" + r.opts.transitionEffect,
                        n.fancybox.animate(c.$slide, d, e, function() {
                            c.$slide.removeClass(d).removeAttr("style")
                        }))))
                    }
                }
            },
            createSlide: function(t) {
                var e, o, i = this;
                return o = t % i.group.length,
                o = o < 0 ? i.group.length + o : o,
                !i.slides[t] && i.group[o] && (e = n('<div class="fancybox-slide"></div>').appendTo(i.$refs.stage),
                i.slides[t] = n.extend(!0, {}, i.group[o], {
                    pos: t,
                    $slide: e,
                    isLoaded: !1
                }),
                i.updateSlide(i.slides[t])),
                i.slides[t]
            },
            scaleToActual: function(t, e, i) {
                var a, s, r, c, l, u = this, d = u.current, f = d.$content, h = parseInt(d.$slide.width(), 10), p = parseInt(d.$slide.height(), 10), g = d.width, b = d.height;
                "image" != d.type || d.hasError || !f || u.isAnimating || (n.fancybox.stop(f),
                u.isAnimating = !0,
                t = t === o ? .5 * h : t,
                e = e === o ? .5 * p : e,
                a = n.fancybox.getTranslate(f),
                c = g / a.width,
                l = b / a.height,
                s = .5 * h - .5 * g,
                r = .5 * p - .5 * b,
                g > h && (s = a.left * c - (t * c - t),
                s > 0 && (s = 0),
                s < h - g && (s = h - g)),
                b > p && (r = a.top * l - (e * l - e),
                r > 0 && (r = 0),
                r < p - b && (r = p - b)),
                u.updateCursor(g, b),
                n.fancybox.animate(f, {
                    top: r,
                    left: s,
                    scaleX: c,
                    scaleY: l
                }, i || 330, function() {
                    u.isAnimating = !1
                }),
                u.SlideShow && u.SlideShow.isActive && u.SlideShow.stop())
            },
            scaleToFit: function(t) {
                var e, o = this, i = o.current, a = i.$content;
                "image" != i.type || i.hasError || !a || o.isAnimating || (n.fancybox.stop(a),
                o.isAnimating = !0,
                e = o.getFitPos(i),
                o.updateCursor(e.width, e.height),
                n.fancybox.animate(a, {
                    top: e.top,
                    left: e.left,
                    scaleX: e.width / a.width(),
                    scaleY: e.height / a.height()
                }, t || 330, function() {
                    o.isAnimating = !1
                }))
            },
            getFitPos: function(t) {
                var e, o, i, a, r, c = this, l = t.$content, u = t.width, d = t.height, f = t.opts.margin;
                return !(!l || !l.length || !u && !d) && ("number" === n.type(f) && (f = [f, f]),
                2 == f.length && (f = [f[0], f[1], f[0], f[1]]),
                s.width() < 800 && (f = [0, 0, 0, 0]),
                e = parseInt(c.$refs.stage.width(), 10) - (f[1] + f[3]),
                o = parseInt(c.$refs.stage.height(), 10) - (f[0] + f[2]),
                i = Math.min(1, e / u, o / d),
                a = Math.floor(i * u),
                r = Math.floor(i * d),
                {
                    top: Math.floor(.5 * (o - r)) + f[0],
                    left: Math.floor(.5 * (e - a)) + f[3],
                    width: a,
                    height: r
                })
            },
            update: function() {
                var t = this;
                n.each(t.slides, function(e, n) {
                    t.updateSlide(n)
                })
            },
            updateSlide: function(t) {
                var e = this
                  , o = t.$content;
                o && (t.width || t.height) && (n.fancybox.stop(o),
                n.fancybox.setTranslate(o, e.getFitPos(t)),
                t.pos === e.currPos && e.updateCursor()),
                t.$slide.trigger("refresh"),
                e.trigger("onUpdate", t)
            },
            updateCursor: function(t, e) {
                var n, i = this, a = i.$refs.container.removeClass("fancybox-is-zoomable fancybox-can-zoomIn fancybox-can-drag fancybox-can-zoomOut");
                i.current && !i.isClosing && (i.isZoomable() ? (a.addClass("fancybox-is-zoomable"),
                n = t !== o && e !== o ? t < i.current.width && e < i.current.height : i.isScaledDown(),
                n ? a.addClass("fancybox-can-zoomIn") : i.current.opts.touch ? a.addClass("fancybox-can-drag") : a.addClass("fancybox-can-zoomOut")) : i.current.opts.touch && a.addClass("fancybox-can-drag"))
            },
            isZoomable: function() {
                var t, e = this, o = e.current;
                if (o && !e.isClosing)
                    return !!("image" === o.type && o.isLoaded && !o.hasError && ("zoom" === o.opts.clickContent || n.isFunction(o.opts.clickContent) && "zoom" === o.opts.clickContent(o)) && (t = e.getFitPos(o),
                    o.width > t.width || o.height > t.height))
            },
            isScaledDown: function() {
                var t = this
                  , e = t.current
                  , o = e.$content
                  , i = !1;
                return o && (i = n.fancybox.getTranslate(o),
                i = i.width < e.width || i.height < e.height),
                i
            },
            canPan: function() {
                var t = this
                  , e = t.current
                  , n = e.$content
                  , o = !1;
                return n && (o = t.getFitPos(e),
                o = Math.abs(n.width() - o.width) > 1 || Math.abs(n.height() - o.height) > 1),
                o
            },
            loadSlide: function(t) {
                var e, o, i, a = this;
                if (!t.isLoading && !t.isLoaded) {
                    switch (t.isLoading = !0,
                    a.trigger("beforeLoad", t),
                    e = t.type,
                    o = t.$slide,
                    o.off("refresh").trigger("onReset").addClass("fancybox-slide--" + (e || "unknown")).addClass(t.opts.slideClass),
                    e) {
                    case "image":
                        a.setImage(t);
                        break;
                    case "iframe":
                        a.setIframe(t);
                        break;
                    case "html":
                        a.setContent(t, t.src || t.content);
                        break;
                    case "inline":
                        n(t.src).length ? a.setContent(t, n(t.src)) : a.setError(t);
                        break;
                    case "ajax":
                        a.showLoading(t),
                        i = n.ajax(n.extend({}, t.opts.ajax.settings, {
                            url: t.src,
                            success: function(e, n) {
                                "success" === n && a.setContent(t, e)
                            },
                            error: function(e, n) {
                                e && "abort" !== n && a.setError(t)
                            }
                        })),
                        o.one("onReset", function() {
                            i.abort()
                        });
                        break;
                    default:
                        a.setError(t)
                    }
                    return !0
                }
            },
            setImage: function(e) {
                var o, i, a, s, r = this, c = e.opts.image.srcset;
                if (c) {
                    a = t.devicePixelRatio || 1,
                    s = t.innerWidth * a,
                    i = c.split(",").map(function(t) {
                        var e = {};
                        return t.trim().split(/\s+/).forEach(function(t, n) {
                            var o = parseInt(t.substring(0, t.length - 1), 10);
                            return 0 === n ? e.url = t : void (o && (e.value = o,
                            e.postfix = t[t.length - 1]))
                        }),
                        e
                    }),
                    i.sort(function(t, e) {
                        return t.value - e.value
                    });
                    for (var l = 0; l < i.length; l++) {
                        var u = i[l];
                        if ("w" === u.postfix && u.value >= s || "x" === u.postfix && u.value >= a) {
                            o = u;
                            break
                        }
                    }
                    !o && i.length && (o = i[i.length - 1]),
                    o && (e.src = o.url,
                    e.width && e.height && "w" == o.postfix && (e.height = e.width / e.height * o.value,
                    e.width = o.value))
                }
                e.$content = n('<div class="fancybox-image-wrap"></div>').addClass("fancybox-is-hidden").appendTo(e.$slide),
                e.opts.preload !== !1 && e.opts.width && e.opts.height && (e.opts.thumb || e.opts.$thumb) ? (e.width = e.opts.width,
                e.height = e.opts.height,
                e.$ghost = n("<img />").one("error", function() {
                    n(this).remove(),
                    e.$ghost = null,
                    r.setBigImage(e)
                }).one("load", function() {
                    r.afterLoad(e),
                    r.setBigImage(e)
                }).addClass("fancybox-image").appendTo(e.$content).attr("src", e.opts.thumb || e.opts.$thumb.attr("src"))) : r.setBigImage(e)
            },
            setBigImage: function(t) {
                var e = this
                  , o = n("<img />");
                t.$image = o.one("error", function() {
                    e.setError(t)
                }).one("load", function() {
                    clearTimeout(t.timouts),
                    t.timouts = null,
                    e.isClosing || (t.width = this.naturalWidth,
                    t.height = this.naturalHeight,
                    t.opts.image.srcset && o.attr("sizes", "100vw").attr("srcset", t.opts.image.srcset),
                    e.hideLoading(t),
                    t.$ghost ? t.timouts = setTimeout(function() {
                        t.timouts = null,
                        t.$ghost.hide()
                    }, Math.min(300, Math.max(1e3, t.height / 1600))) : e.afterLoad(t))
                }).addClass("fancybox-image").attr("src", t.src).appendTo(t.$content),
                o[0].complete ? o.trigger("load") : o[0].error ? o.trigger("error") : t.timouts = setTimeout(function() {
                    o[0].complete || t.hasError || e.showLoading(t)
                }, 100)
            },
            setIframe: function(t) {
                var e, i = this, a = t.opts.iframe, s = t.$slide;
                t.$content = n('<div class="fancybox-content' + (a.preload ? " fancybox-is-hidden" : "") + '"></div>').css(a.css).appendTo(s),
                e = n(a.tpl.replace(/\{rnd\}/g, (new Date).getTime())).attr(a.attr).appendTo(t.$content),
                a.preload ? (i.showLoading(t),
                e.on("load.fb error.fb", function(e) {
                    this.isReady = 1,
                    t.$slide.trigger("refresh"),
                    i.afterLoad(t)
                }),
                s.on("refresh.fb", function() {
                    var n, i, s, r, c, l = t.$content;
                    if (1 === e[0].isReady) {
                        try {
                            n = e.contents(),
                            i = n.find("body")
                        } catch (t) {}
                        i && i.length && (a.css.width === o || a.css.height === o) && (s = e[0].contentWindow.document.documentElement.scrollWidth,
                        r = Math.ceil(i.outerWidth(!0) + (l.width() - s)),
                        c = Math.ceil(i.outerHeight(!0)),
                        l.css({
                            width: a.css.width === o ? r + (l.outerWidth() - l.innerWidth()) : a.css.width,
                            height: a.css.height === o ? c + (l.outerHeight() - l.innerHeight()) : a.css.height
                        })),
                        l.removeClass("fancybox-is-hidden")
                    }
                })) : this.afterLoad(t),
                e.attr("src", t.src),
                t.opts.smallBtn === !0 && t.$content.prepend(i.translate(t, t.opts.btnTpl.smallBtn)),
                s.one("onReset", function() {
                    try {
                        n(this).find("iframe").hide().attr("src", "//about:blank")
                    } catch (t) {}
                    n(this).empty(),
                    t.isLoaded = !1
                })
            },
            setContent: function(t, e) {
                var o = this;
                o.isClosing || (o.hideLoading(t),
                t.$slide.empty(),
                l(e) && e.parent().length ? (e.parent(".fancybox-slide--inline").trigger("onReset"),
                t.$placeholder = n("<div></div>").hide().insertAfter(e),
                e.css("display", "inline-block")) : t.hasError || ("string" === n.type(e) && (e = n("<div>").append(n.trim(e)).contents(),
                3 === e[0].nodeType && (e = n("<div>").html(e))),
                t.opts.filter && (e = n("<div>").html(e).find(t.opts.filter))),
                t.$slide.one("onReset", function() {
                    t.$placeholder && (t.$placeholder.after(e.hide()).remove(),
                    t.$placeholder = null),
                    t.$smallBtn && (t.$smallBtn.remove(),
                    t.$smallBtn = null),
                    t.hasError || (n(this).empty(),
                    t.isLoaded = !1)
                }),
                t.$content = n(e).appendTo(t.$slide),
                t.opts.smallBtn && !t.$smallBtn && (t.$smallBtn = n(o.translate(t, t.opts.btnTpl.smallBtn)).appendTo(t.$content)),
                this.afterLoad(t))
            },
            setError: function(t) {
                t.hasError = !0,
                t.$slide.removeClass("fancybox-slide--" + t.type),
                this.setContent(t, this.translate(t, t.opts.errorTpl))
            },
            showLoading: function(t) {
                var e = this;
                t = t || e.current,
                t && !t.$spinner && (t.$spinner = n(e.opts.spinnerTpl).appendTo(t.$slide))
            },
            hideLoading: function(t) {
                var e = this;
                t = t || e.current,
                t && t.$spinner && (t.$spinner.remove(),
                delete t.$spinner)
            },
            afterLoad: function(t) {
                var e = this;
                e.isClosing || (t.isLoading = !1,
                t.isLoaded = !0,
                e.trigger("afterLoad", t),
                e.hideLoading(t),
                t.opts.protect && t.$content && !t.hasError && (t.$content.on("contextmenu.fb", function(t) {
                    return 2 == t.button && t.preventDefault(),
                    !0
                }),
                "image" === t.type && n('<div class="fancybox-spaceball"></div>').appendTo(t.$content)),
                e.revealContent(t))
            },
            revealContent: function(t) {
                var e, i, a, s, r, c = this, l = t.$slide, u = !1;
                return e = t.opts[c.firstRun ? "animationEffect" : "transitionEffect"],
                a = t.opts[c.firstRun ? "animationDuration" : "transitionDuration"],
                a = parseInt(t.forcedDuration === o ? a : t.forcedDuration, 10),
                !t.isMoved && t.pos === c.currPos && a || (e = !1),
                "zoom" !== e || t.pos === c.currPos && a && "image" === t.type && !t.hasError && (u = c.getThumbPos(t)) || (e = "fade"),
                "zoom" === e ? (r = c.getFitPos(t),
                r.scaleX = Math.round(r.width / u.width * 100) / 100,
                r.scaleY = Math.round(r.height / u.height * 100) / 100,
                delete r.width,
                delete r.height,
                s = t.opts.zoomOpacity,
                "auto" == s && (s = Math.abs(t.width / t.height - u.width / u.height) > .1),
                s && (u.opacity = .1,
                r.opacity = 1),
                n.fancybox.setTranslate(t.$content.removeClass("fancybox-is-hidden"), u),
                f(t.$content),
                void n.fancybox.animate(t.$content, r, a, function() {
                    c.complete()
                })) : (c.updateSlide(t),
                e ? (n.fancybox.stop(l),
                i = "fancybox-animated fancybox-slide--" + (t.pos > c.prevPos ? "next" : "previous") + " fancybox-fx-" + e,
                l.removeAttr("style").removeClass("fancybox-slide--current fancybox-slide--next fancybox-slide--previous").addClass(i),
                t.$content.removeClass("fancybox-is-hidden"),
                f(l),
                void n.fancybox.animate(l, "fancybox-slide--current", a, function(e) {
                    l.removeClass(i).removeAttr("style"),
                    t.pos === c.currPos && c.complete()
                }, !0)) : (f(l),
                t.$content.removeClass("fancybox-is-hidden"),
                void (t.pos === c.currPos && c.complete())))
            },
            getThumbPos: function(o) {
                var i, a = this, s = !1, r = function(e) {
                    for (var o, i = e[0], a = i.getBoundingClientRect(), s = []; null !== i.parentElement; )
                        "hidden" !== n(i.parentElement).css("overflow") && "auto" !== n(i.parentElement).css("overflow") || s.push(i.parentElement.getBoundingClientRect()),
                        i = i.parentElement;
                    return o = s.every(function(t) {
                        var e = Math.min(a.right, t.right) - Math.max(a.left, t.left)
                          , n = Math.min(a.bottom, t.bottom) - Math.max(a.top, t.top);
                        return e > 0 && n > 0
                    }),
                    o && a.bottom > 0 && a.right > 0 && a.left < n(t).width() && a.top < n(t).height()
                }, c = o.opts.$thumb, l = c ? c.offset() : 0;
                return l && c[0].ownerDocument === e && r(c) && (i = a.$refs.stage.offset(),
                s = {
                    top: l.top - i.top + parseFloat(c.css("border-top-width") || 0),
                    left: l.left - i.left + parseFloat(c.css("border-left-width") || 0),
                    width: c.width(),
                    height: c.height(),
                    scaleX: 1,
                    scaleY: 1
                }),
                s
            },
            complete: function() {
                var t = this
                  , o = t.current
                  , i = {};
                o.isMoved || !o.isLoaded || o.isComplete || (o.isComplete = !0,
                o.$slide.siblings().trigger("onReset"),
                f(o.$slide),
                o.$slide.addClass("fancybox-slide--complete"),
                n.each(t.slides, function(e, o) {
                    o.pos >= t.currPos - 1 && o.pos <= t.currPos + 1 ? i[o.pos] = o : o && (n.fancybox.stop(o.$slide),
                    o.$slide.unbind().remove())
                }),
                t.slides = i,
                t.updateCursor(),
                t.trigger("afterShow"),
                (n(e.activeElement).is("[disabled]") || o.opts.autoFocus && "image" != o.type && "iframe" !== o.type) && t.focus())
            },
            preload: function() {
                var t, e, n = this;
                n.group.length < 2 || (t = n.slides[n.currPos + 1],
                e = n.slides[n.currPos - 1],
                t && "image" === t.type && n.loadSlide(t),
                e && "image" === e.type && n.loadSlide(e))
            },
            focus: function() {
                var t, e = this.current;
                this.isClosing || (t = e && e.isComplete ? e.$slide.find("button,:input,[tabindex],a").filter(":not([disabled]):visible:first") : null,
                t = t && t.length ? t : this.$refs.container,
                t.focus())
            },
            activate: function() {
                var t = this;
                n(".fancybox-container").each(function() {
                    var e = n(this).data("FancyBox");
                    e && e.uid !== t.uid && !e.isClosing && e.trigger("onDeactivate")
                }),
                t.current && (t.$refs.container.index() > 0 && t.$refs.container.prependTo(e.body),
                t.updateControls()),
                t.trigger("onActivate"),
                t.addEvents()
            },
            close: function(t, e) {
                var o, i, a, s, r, c, l = this, f = l.current, h = function() {
                    l.cleanUp(t)
                };
                return !l.isClosing && (l.isClosing = !0,
                l.trigger("beforeClose", t) === !1 ? (l.isClosing = !1,
                u(function() {
                    l.update()
                }),
                !1) : (l.removeEvents(),
                f.timouts && clearTimeout(f.timouts),
                a = f.$content,
                o = f.opts.animationEffect,
                i = n.isNumeric(e) ? e : o ? f.opts.animationDuration : 0,
                f.$slide.off(d).removeClass("fancybox-slide--complete fancybox-slide--next fancybox-slide--previous fancybox-animated"),
                f.$slide.siblings().trigger("onReset").remove(),
                i && l.$refs.container.removeClass("fancybox-is-open").addClass("fancybox-is-closing"),
                l.hideLoading(f),
                l.hideControls(),
                l.updateCursor(),
                "zoom" !== o || t !== !0 && a && i && "image" === f.type && !f.hasError && (c = l.getThumbPos(f)) || (o = "fade"),
                "zoom" === o ? (n.fancybox.stop(a),
                r = n.fancybox.getTranslate(a),
                r.width = r.width * r.scaleX,
                r.height = r.height * r.scaleY,
                s = f.opts.zoomOpacity,
                "auto" == s && (s = Math.abs(f.width / f.height - c.width / c.height) > .1),
                s && (c.opacity = 0),
                r.scaleX = r.width / c.width,
                r.scaleY = r.height / c.height,
                r.width = c.width,
                r.height = c.height,
                n.fancybox.setTranslate(f.$content, r),
                n.fancybox.animate(f.$content, c, i, h),
                !0) : (o && i ? t === !0 ? setTimeout(h, i) : n.fancybox.animate(f.$slide.removeClass("fancybox-slide--current"), "fancybox-animated fancybox-slide--previous fancybox-fx-" + o, i, h) : h(),
                !0)))
            },
            cleanUp: function(t) {
                var e, o = this;
                o.current.$slide.trigger("onReset"),
                o.$refs.container.empty().remove(),
                o.trigger("afterClose", t),
                o.$lastFocus && !o.current.focusBack && o.$lastFocus.focus(),
                o.current = null,
                e = n.fancybox.getInstance(),
                e ? e.activate() : (s.scrollTop(o.scrollTop).scrollLeft(o.scrollLeft),
                n("html").removeClass("fancybox-enabled"),
                n("#fancybox-style-noscroll").remove())
            },
            trigger: function(t, e) {
                var o, i = Array.prototype.slice.call(arguments, 1), a = this, s = e && e.opts ? e : a.current;
                return s ? i.unshift(s) : s = a,
                i.unshift(a),
                n.isFunction(s.opts[t]) && (o = s.opts[t].apply(s, i)),
                o === !1 ? o : void ("afterClose" === t ? r.trigger(t + ".fb", i) : a.$refs.container.trigger(t + ".fb", i))
            },
            updateControls: function(t) {
                var e = this
                  , o = e.current
                  , i = o.index
                  , a = o.opts
                  , s = a.caption
                  , r = e.$refs.caption;
                o.$slide.trigger("refresh"),
                e.$caption = s && s.length ? r.html(s) : null,
                e.isHiddenControls || e.showControls(),
                n("[data-fancybox-count]").html(e.group.length),
                n("[data-fancybox-index]").html(i + 1),
                n("[data-fancybox-prev]").prop("disabled", !a.loop && i <= 0),
                n("[data-fancybox-next]").prop("disabled", !a.loop && i >= e.group.length - 1)
            },
            hideControls: function() {
                this.isHiddenControls = !0,
                this.$refs.container.removeClass("fancybox-show-infobar fancybox-show-toolbar fancybox-show-caption fancybox-show-nav")
            },
            showControls: function() {
                var t = this
                  , e = t.current ? t.current.opts : t.opts
                  , n = t.$refs.container;
                t.isHiddenControls = !1,
                t.idleSecondsCounter = 0,
                n.toggleClass("fancybox-show-toolbar", !(!e.toolbar || !e.buttons)).toggleClass("fancybox-show-infobar", !!(e.infobar && t.group.length > 1)).toggleClass("fancybox-show-nav", !!(e.arrows && t.group.length > 1)).toggleClass("fancybox-is-modal", !!e.modal),
                t.$caption ? n.addClass("fancybox-show-caption ") : n.removeClass("fancybox-show-caption")
            },
            toggleControls: function() {
                this.isHiddenControls ? this.showControls() : this.hideControls()
            }
        }),
        n.fancybox = {
            version: "3.1.20",
            defaults: a,
            getInstance: function(t) {
                var e = n('.fancybox-container:not(".fancybox-is-closing"):first').data("FancyBox")
                  , o = Array.prototype.slice.call(arguments, 1);
                return e instanceof h && ("string" === n.type(t) ? e[t].apply(e, o) : "function" === n.type(t) && t.apply(e, o),
                e)
            },
            open: function(t, e, n) {
                return new h(t,e,n)
            },
            close: function(t) {
                var e = this.getInstance();
                e && (e.close(),
                t === !0 && this.close())
            },
            destroy: function() {
                this.close(!0),
                r.off("click.fb-start")
            },
            isMobile: e.createTouch !== o && /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent),
            use3d: function() {
                var n = e.createElement("div");
                return t.getComputedStyle && t.getComputedStyle(n).getPropertyValue("transform") && !(e.documentMode && e.documentMode < 11)
            }(),
            getTranslate: function(t) {
                var e;
                if (!t || !t.length)
                    return !1;
                if (e = t.eq(0).css("transform"),
                e && e.indexOf("matrix") !== -1 ? (e = e.split("(")[1],
                e = e.split(")")[0],
                e = e.split(",")) : e = [],
                e.length)
                    e = e.length > 10 ? [e[13], e[12], e[0], e[5]] : [e[5], e[4], e[0], e[3]],
                    e = e.map(parseFloat);
                else {
                    e = [0, 0, 1, 1];
                    var n = /\.*translate\((.*)px,(.*)px\)/i
                      , o = n.exec(t.eq(0).attr("style"));
                    o && (e[0] = parseFloat(o[2]),
                    e[1] = parseFloat(o[1]))
                }
                return {
                    top: e[0],
                    left: e[1],
                    scaleX: e[2],
                    scaleY: e[3],
                    opacity: parseFloat(t.css("opacity")),
                    width: t.width(),
                    height: t.height()
                }
            },
            setTranslate: function(t, e) {
                var n = ""
                  , i = {};
                if (t && e)
                    return e.left === o && e.top === o || (n = (e.left === o ? t.position().left : e.left) + "px, " + (e.top === o ? t.position().top : e.top) + "px",
                    n = this.use3d ? "translate3d(" + n + ", 0px)" : "translate(" + n + ")"),
                    e.scaleX !== o && e.scaleY !== o && (n = (n.length ? n + " " : "") + "scale(" + e.scaleX + ", " + e.scaleY + ")"),
                    n.length && (i.transform = n),
                    e.opacity !== o && (i.opacity = e.opacity),
                    e.width !== o && (i.width = e.width),
                    e.height !== o && (i.height = e.height),
                    t.css(i)
            },
            animate: function(t, e, i, a, s) {
                var r = d || "transitionend";
                n.isFunction(i) && (a = i,
                i = null),
                n.isPlainObject(e) || t.removeAttr("style"),
                t.on(r, function(i) {
                    (!i || !i.originalEvent || t.is(i.originalEvent.target) && "z-index" != i.originalEvent.propertyName) && (t.off(r),
                    n.isPlainObject(e) ? e.scaleX !== o && e.scaleY !== o && (t.css("transition-duration", "0ms"),
                    e.width = t.width() * e.scaleX,
                    e.height = t.height() * e.scaleY,
                    e.scaleX = 1,
                    e.scaleY = 1,
                    n.fancybox.setTranslate(t, e)) : s !== !0 && t.removeClass(e),
                    n.isFunction(a) && a(i))
                }),
                n.isNumeric(i) && t.css("transition-duration", i + "ms"),
                n.isPlainObject(e) ? n.fancybox.setTranslate(t, e) : t.addClass(e),
                t.data("timer", setTimeout(function() {
                    t.trigger("transitionend")
                }, i + 16))
            },
            stop: function(t) {
                clearTimeout(t.data("timer")),
                t.off(d)
            }
        },
        n.fn.fancybox = function(t) {
            var e;
            return t = t || {},
            e = t.selector || !1,
            e ? n("body").off("click.fb-start", e).on("click.fb-start", e, {
                items: n(e),
                options: t
            }, i) : this.off("click.fb-start").on("click.fb-start", {
                items: this,
                options: t
            }, i),
            this
        }
        ,
        r.on("click.fb-start", "[data-fancybox]", i)
    }
}(window, document, window.jQuery),
function(t) {
    "use strict";
    var e = function(e, n, o) {
        if (e)
            return o = o || "",
            "object" === t.type(o) && (o = t.param(o, !0)),
            t.each(n, function(t, n) {
                e = e.replace("$" + t, n || "")
            }),
            o.length && (e += (e.indexOf("?") > 0 ? "&" : "?") + o),
            e
    }
      , n = {
        youtube: {
            matcher: /(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(watch\?(.*&)?v=|v\/|u\/|embed\/?)?(videoseries\?list=(.*)|[\w-]{11}|\?listType=(.*)&list=(.*))(.*)/i,
            params: {
                autoplay: 1,
                autohide: 1,
                fs: 1,
                rel: 0,
                hd: 1,
                wmode: "transparent",
                enablejsapi: 1,
                html5: 1
            },
            paramPlace: 8,
            type: "iframe",
            url: "//www.youtube.com/embed/$4",
            thumb: "//img.youtube.com/vi/$4/hqdefault.jpg"
        },
        vimeo: {
            matcher: /^.+vimeo.com\/(.*\/)?([\d]+)(.*)?/,
            params: {
                autoplay: 1,
                hd: 1,
                show_title: 1,
                show_byline: 1,
                show_portrait: 0,
                fullscreen: 1,
                api: 1
            },
            paramPlace: 3,
            type: "iframe",
            url: "//player.vimeo.com/video/$2"
        },
        metacafe: {
            matcher: /metacafe.com\/watch\/(\d+)\/(.*)?/,
            type: "iframe",
            url: "//www.metacafe.com/embed/$1/?ap=1"
        },
        dailymotion: {
            matcher: /dailymotion.com\/video\/(.*)\/?(.*)/,
            params: {
                additionalInfos: 0,
                autoStart: 1
            },
            type: "iframe",
            url: "//www.dailymotion.com/embed/video/$1"
        },
        vine: {
            matcher: /vine.co\/v\/([a-zA-Z0-9\?\=\-]+)/,
            type: "iframe",
            url: "//vine.co/v/$1/embed/simple"
        },
        instagram: {
            matcher: /(instagr\.am|instagram\.com)\/p\/([a-zA-Z0-9_\-]+)\/?/i,
            type: "image",
            url: "//$1/p/$2/media/?size=l"
        },
        google_maps: {
            matcher: /(maps\.)?google\.([a-z]{2,3}(\.[a-z]{2})?)\/(((maps\/(place\/(.*)\/)?\@(.*),(\d+.?\d+?)z))|(\?ll=))(.*)?/i,
            type: "iframe",
            url: function(t) {
                return "//maps.google." + t[2] + "/?ll=" + (t[9] ? t[9] + "&z=" + Math.floor(t[10]) + (t[12] ? t[12].replace(/^\//, "&") : "") : t[12]) + "&output=" + (t[12] && t[12].indexOf("layer=c") > 0 ? "svembed" : "embed")
            }
        }
    };
    t(document).on("onInit.fb", function(o, i) {
        t.each(i.group, function(o, i) {
            var a, s, r, c, l, u, d, f = i.src || "", h = !1;
            i.type || (a = t.extend(!0, {}, n, i.opts.media),
            t.each(a, function(n, o) {
                if (r = f.match(o.matcher),
                u = {},
                d = n,
                r) {
                    if (h = o.type,
                    o.paramPlace && r[o.paramPlace]) {
                        l = r[o.paramPlace],
                        "?" == l[0] && (l = l.substring(1)),
                        l = l.split("&");
                        for (var a = 0; a < l.length; ++a) {
                            var p = l[a].split("=", 2);
                            2 == p.length && (u[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " ")))
                        }
                    }
                    return c = t.extend(!0, {}, o.params, i.opts[n], u),
                    f = "function" === t.type(o.url) ? o.url.call(this, r, c, i) : e(o.url, r, c),
                    s = "function" === t.type(o.thumb) ? o.thumb.call(this, r, c, i) : e(o.thumb, r),
                    "vimeo" === d && (f = f.replace("&%23", "#")),
                    !1
                }
            }),
            h ? (i.src = f,
            i.type = h,
            i.opts.thumb || i.opts.$thumb && i.opts.$thumb.length || (i.opts.thumb = s),
            "iframe" === h && (t.extend(!0, i.opts, {
                iframe: {
                    preload: !1,
                    attr: {
                        scrolling: "no"
                    }
                }
            }),
            i.contentProvider = d,
            i.opts.slideClass += " fancybox-slide--" + ("google_maps" == d ? "map" : "video"))) : i.type = "image")
        })
    })
}(window.jQuery),
function(t, e, n) {
    "use strict";
    var o = function() {
        return t.requestAnimationFrame || t.webkitRequestAnimationFrame || t.mozRequestAnimationFrame || t.oRequestAnimationFrame || function(e) {
            return t.setTimeout(e, 1e3 / 60)
        }
    }()
      , i = function() {
        return t.cancelAnimationFrame || t.webkitCancelAnimationFrame || t.mozCancelAnimationFrame || t.oCancelAnimationFrame || function(e) {
            t.clearTimeout(e)
        }
    }()
      , a = function(e) {
        var n = [];
        e = e.originalEvent || e || t.e,
        e = e.touches && e.touches.length ? e.touches : e.changedTouches && e.changedTouches.length ? e.changedTouches : [e];
        for (var o in e)
            e[o].pageX ? n.push({
                x: e[o].pageX,
                y: e[o].pageY
            }) : e[o].clientX && n.push({
                x: e[o].clientX,
                y: e[o].clientY
            });
        return n
    }
      , s = function(t, e, n) {
        return e && t ? "x" === n ? t.x - e.x : "y" === n ? t.y - e.y : Math.sqrt(Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)) : 0
    }
      , r = function(t) {
        if (t.is("a,button,input,select,textarea") || n.isFunction(t.get(0).onclick))
            return !0;
        for (var e = 0, o = t[0].attributes, i = o.length; e < i; e++)
            if ("data-fancybox-" === o[e].nodeName.substr(0, 14))
                return !0;
        return !1
    }
      , c = function(e) {
        var n = t.getComputedStyle(e)["overflow-y"]
          , o = t.getComputedStyle(e)["overflow-x"]
          , i = ("scroll" === n || "auto" === n) && e.scrollHeight > e.clientHeight
          , a = ("scroll" === o || "auto" === o) && e.scrollWidth > e.clientWidth;
        return i || a
    }
      , l = function(t) {
        for (var e = !1; ; ) {
            if (e = c(t.get(0)))
                break;
            if (t = t.parent(),
            !t.length || t.hasClass("fancybox-stage") || t.is("body"))
                break
        }
        return e
    }
      , u = function(t) {
        var e = this;
        e.instance = t,
        e.$bg = t.$refs.bg,
        e.$stage = t.$refs.stage,
        e.$container = t.$refs.container,
        e.destroy(),
        e.$container.on("touchstart.fb.touch mousedown.fb.touch", n.proxy(e, "ontouchstart"))
    };
    u.prototype.destroy = function() {
        this.$container.off(".fb.touch")
    }
    ,
    u.prototype.ontouchstart = function(o) {
        var i = this
          , c = n(o.target)
          , u = i.instance
          , d = u.current
          , f = d.$content
          , h = "touchstart" == o.type;
        if (h && i.$container.off("mousedown.fb.touch"),
        !d || i.instance.isAnimating || i.instance.isClosing)
            return o.stopPropagation(),
            void o.preventDefault();
        if ((!o.originalEvent || 2 != o.originalEvent.button) && c.length && !r(c) && !r(c.parent()) && !(o.originalEvent.clientX > c[0].clientWidth + c.offset().left) && (i.startPoints = a(o),
        i.startPoints && !(i.startPoints.length > 1 && u.isSliding))) {
            if (i.$target = c,
            i.$content = f,
            i.canTap = !0,
            n(e).off(".fb.touch"),
            n(e).on(h ? "touchend.fb.touch touchcancel.fb.touch" : "mouseup.fb.touch mouseleave.fb.touch", n.proxy(i, "ontouchend")),
            n(e).on(h ? "touchmove.fb.touch" : "mousemove.fb.touch", n.proxy(i, "ontouchmove")),
            o.stopPropagation(),
            !u.current.opts.touch && !u.canPan() || !c.is(i.$stage) && !i.$stage.find(c).length)
                return void (c.is("img") && o.preventDefault());
            n.fancybox.isMobile && (l(i.$target) || l(i.$target.parent())) || o.preventDefault(),
            i.canvasWidth = Math.round(d.$slide[0].clientWidth),
            i.canvasHeight = Math.round(d.$slide[0].clientHeight),
            i.startTime = (new Date).getTime(),
            i.distanceX = i.distanceY = i.distance = 0,
            i.isPanning = !1,
            i.isSwiping = !1,
            i.isZooming = !1,
            i.sliderStartPos = i.sliderLastPos || {
                top: 0,
                left: 0
            },
            i.contentStartPos = n.fancybox.getTranslate(i.$content),
            i.contentLastPos = null,
            1 !== i.startPoints.length || i.isZooming || (i.canTap = !u.isSliding,
            "image" === d.type && (i.contentStartPos.width > i.canvasWidth + 1 || i.contentStartPos.height > i.canvasHeight + 1) ? (n.fancybox.stop(i.$content),
            i.$content.css("transition-duration", "0ms"),
            i.isPanning = !0) : i.isSwiping = !0,
            i.$container.addClass("fancybox-controls--isGrabbing")),
            2 !== i.startPoints.length || u.isAnimating || d.hasError || "image" !== d.type || !d.isLoaded && !d.$ghost || (i.isZooming = !0,
            i.isSwiping = !1,
            i.isPanning = !1,
            n.fancybox.stop(i.$content),
            i.$content.css("transition-duration", "0ms"),
            i.centerPointStartX = .5 * (i.startPoints[0].x + i.startPoints[1].x) - n(t).scrollLeft(),
            i.centerPointStartY = .5 * (i.startPoints[0].y + i.startPoints[1].y) - n(t).scrollTop(),
            i.percentageOfImageAtPinchPointX = (i.centerPointStartX - i.contentStartPos.left) / i.contentStartPos.width,
            i.percentageOfImageAtPinchPointY = (i.centerPointStartY - i.contentStartPos.top) / i.contentStartPos.height,
            i.startDistanceBetweenFingers = s(i.startPoints[0], i.startPoints[1]))
        }
    }
    ,
    u.prototype.ontouchmove = function(t) {
        var e = this;
        if (e.newPoints = a(t),
        n.fancybox.isMobile && (l(e.$target) || l(e.$target.parent())))
            return t.stopPropagation(),
            void (e.canTap = !1);
        if ((e.instance.current.opts.touch || e.instance.canPan()) && e.newPoints && e.newPoints.length && (e.distanceX = s(e.newPoints[0], e.startPoints[0], "x"),
        e.distanceY = s(e.newPoints[0], e.startPoints[0], "y"),
        e.distance = s(e.newPoints[0], e.startPoints[0]),
        e.distance > 0)) {
            if (!e.$target.is(e.$stage) && !e.$stage.find(e.$target).length)
                return;
            t.stopPropagation(),
            t.preventDefault(),
            e.isSwiping ? e.onSwipe() : e.isPanning ? e.onPan() : e.isZooming && e.onZoom()
        }
    }
    ,
    u.prototype.onSwipe = function() {
        var e, a = this, s = a.isSwiping, r = a.sliderStartPos.left || 0;
        s === !0 ? Math.abs(a.distance) > 10 && (a.canTap = !1,
        a.instance.group.length < 2 && a.instance.opts.touch.vertical ? a.isSwiping = "y" : a.instance.isSliding || a.instance.opts.touch.vertical === !1 || "auto" === a.instance.opts.touch.vertical && n(t).width() > 800 ? a.isSwiping = "x" : (e = Math.abs(180 * Math.atan2(a.distanceY, a.distanceX) / Math.PI),
        a.isSwiping = e > 45 && e < 135 ? "y" : "x"),
        a.instance.isSliding = a.isSwiping,
        a.startPoints = a.newPoints,
        n.each(a.instance.slides, function(t, e) {
            n.fancybox.stop(e.$slide),
            e.$slide.css("transition-duration", "0ms"),
            e.inTransition = !1,
            e.pos === a.instance.current.pos && (a.sliderStartPos.left = n.fancybox.getTranslate(e.$slide).left)
        }),
        a.instance.SlideShow && a.instance.SlideShow.isActive && a.instance.SlideShow.stop()) : ("x" == s && (a.distanceX > 0 && (a.instance.group.length < 2 || 0 === a.instance.current.index && !a.instance.current.opts.loop) ? r += Math.pow(a.distanceX, .8) : a.distanceX < 0 && (a.instance.group.length < 2 || a.instance.current.index === a.instance.group.length - 1 && !a.instance.current.opts.loop) ? r -= Math.pow(-a.distanceX, .8) : r += a.distanceX),
        a.sliderLastPos = {
            top: "x" == s ? 0 : a.sliderStartPos.top + a.distanceY,
            left: r
        },
        a.requestId && (i(a.requestId),
        a.requestId = null),
        a.requestId = o(function() {
            a.sliderLastPos && (n.each(a.instance.slides, function(t, e) {
                var o = e.pos - a.instance.currPos;
                n.fancybox.setTranslate(e.$slide, {
                    top: a.sliderLastPos.top,
                    left: a.sliderLastPos.left + o * a.canvasWidth + o * e.opts.gutter
                })
            }),
            a.$container.addClass("fancybox-is-sliding"))
        }))
    }
    ,
    u.prototype.onPan = function() {
        var t, e, a, s = this;
        s.canTap = !1,
        t = s.contentStartPos.width > s.canvasWidth ? s.contentStartPos.left + s.distanceX : s.contentStartPos.left,
        e = s.contentStartPos.top + s.distanceY,
        a = s.limitMovement(t, e, s.contentStartPos.width, s.contentStartPos.height),
        a.scaleX = s.contentStartPos.scaleX,
        a.scaleY = s.contentStartPos.scaleY,
        s.contentLastPos = a,
        s.requestId && (i(s.requestId),
        s.requestId = null),
        s.requestId = o(function() {
            n.fancybox.setTranslate(s.$content, s.contentLastPos)
        })
    }
    ,
    u.prototype.limitMovement = function(t, e, n, o) {
        var i, a, s, r, c = this, l = c.canvasWidth, u = c.canvasHeight, d = c.contentStartPos.left, f = c.contentStartPos.top, h = c.distanceX, p = c.distanceY;
        return i = Math.max(0, .5 * l - .5 * n),
        a = Math.max(0, .5 * u - .5 * o),
        s = Math.min(l - n, .5 * l - .5 * n),
        r = Math.min(u - o, .5 * u - .5 * o),
        n > l && (h > 0 && t > i && (t = i - 1 + Math.pow(-i + d + h, .8) || 0),
        h < 0 && t < s && (t = s + 1 - Math.pow(s - d - h, .8) || 0)),
        o > u && (p > 0 && e > a && (e = a - 1 + Math.pow(-a + f + p, .8) || 0),
        p < 0 && e < r && (e = r + 1 - Math.pow(r - f - p, .8) || 0)),
        {
            top: e,
            left: t
        }
    }
    ,
    u.prototype.limitPosition = function(t, e, n, o) {
        var i = this
          , a = i.canvasWidth
          , s = i.canvasHeight;
        return n > a ? (t = t > 0 ? 0 : t,
        t = t < a - n ? a - n : t) : t = Math.max(0, a / 2 - n / 2),
        o > s ? (e = e > 0 ? 0 : e,
        e = e < s - o ? s - o : e) : e = Math.max(0, s / 2 - o / 2),
        {
            top: e,
            left: t
        }
    }
    ,
    u.prototype.onZoom = function() {
        var e = this
          , a = e.contentStartPos.width
          , r = e.contentStartPos.height
          , c = e.contentStartPos.left
          , l = e.contentStartPos.top
          , u = s(e.newPoints[0], e.newPoints[1])
          , d = u / e.startDistanceBetweenFingers
          , f = Math.floor(a * d)
          , h = Math.floor(r * d)
          , p = (a - f) * e.percentageOfImageAtPinchPointX
          , g = (r - h) * e.percentageOfImageAtPinchPointY
          , b = (e.newPoints[0].x + e.newPoints[1].x) / 2 - n(t).scrollLeft()
          , m = (e.newPoints[0].y + e.newPoints[1].y) / 2 - n(t).scrollTop()
          , y = b - e.centerPointStartX
          , v = m - e.centerPointStartY
          , x = c + (p + y)
          , w = l + (g + v)
          , $ = {
            top: w,
            left: x,
            scaleX: e.contentStartPos.scaleX * d,
            scaleY: e.contentStartPos.scaleY * d
        };
        e.canTap = !1,
        e.newWidth = f,
        e.newHeight = h,
        e.contentLastPos = $,
        e.requestId && (i(e.requestId),
        e.requestId = null),
        e.requestId = o(function() {
            n.fancybox.setTranslate(e.$content, e.contentLastPos)
        })
    }
    ,
    u.prototype.ontouchend = function(t) {
        var o = this
          , s = Math.max((new Date).getTime() - o.startTime, 1)
          , r = o.isSwiping
          , c = o.isPanning
          , l = o.isZooming;
        return o.endPoints = a(t),
        o.$container.removeClass("fancybox-controls--isGrabbing"),
        n(e).off(".fb.touch"),
        o.requestId && (i(o.requestId),
        o.requestId = null),
        o.isSwiping = !1,
        o.isPanning = !1,
        o.isZooming = !1,
        o.canTap ? o.onTap(t) : (o.speed = 366,
        o.velocityX = o.distanceX / s * .5,
        o.velocityY = o.distanceY / s * .5,
        o.speedX = Math.max(.5 * o.speed, Math.min(1.5 * o.speed, 1 / Math.abs(o.velocityX) * o.speed)),
        void (c ? o.endPanning() : l ? o.endZooming() : o.endSwiping(r)))
    }
    ,
    u.prototype.endSwiping = function(t) {
        var e = this
          , o = !1;
        e.instance.isSliding = !1,
        e.sliderLastPos = null,
        "y" == t && Math.abs(e.distanceY) > 50 ? (n.fancybox.animate(e.instance.current.$slide, {
            top: e.sliderStartPos.top + e.distanceY + 150 * e.velocityY,
            opacity: 0
        }, 150),
        o = e.instance.close(!0, 300)) : "x" == t && e.distanceX > 50 && e.instance.group.length > 1 ? o = e.instance.previous(e.speedX) : "x" == t && e.distanceX < -50 && e.instance.group.length > 1 && (o = e.instance.next(e.speedX)),
        o !== !1 || "x" != t && "y" != t || e.instance.jumpTo(e.instance.current.index, 150),
        e.$container.removeClass("fancybox-is-sliding")
    }
    ,
    u.prototype.endPanning = function() {
        var t, e, o, i = this;
        i.contentLastPos && (i.instance.current.opts.touch.momentum === !1 ? (t = i.contentLastPos.left,
        e = i.contentLastPos.top) : (t = i.contentLastPos.left + i.velocityX * i.speed,
        e = i.contentLastPos.top + i.velocityY * i.speed),
        o = i.limitPosition(t, e, i.contentStartPos.width, i.contentStartPos.height),
        o.width = i.contentStartPos.width,
        o.height = i.contentStartPos.height,
        n.fancybox.animate(i.$content, o, 330))
    }
    ,
    u.prototype.endZooming = function() {
        var t, e, o, i, a = this, s = a.instance.current, r = a.newWidth, c = a.newHeight;
        a.contentLastPos && (t = a.contentLastPos.left,
        e = a.contentLastPos.top,
        i = {
            top: e,
            left: t,
            width: r,
            height: c,
            scaleX: 1,
            scaleY: 1
        },
        n.fancybox.setTranslate(a.$content, i),
        r < a.canvasWidth && c < a.canvasHeight ? a.instance.scaleToFit(150) : r > s.width || c > s.height ? a.instance.scaleToActual(a.centerPointStartX, a.centerPointStartY, 150) : (o = a.limitPosition(t, e, r, c),
        n.fancybox.setTranslate(a.content, n.fancybox.getTranslate(a.$content)),
        n.fancybox.animate(a.$content, o, 150)))
    }
    ,
    u.prototype.onTap = function(t) {
        var e, o = this, i = n(t.target), s = o.instance, r = s.current, c = t && a(t) || o.startPoints, l = c[0] ? c[0].x - o.$stage.offset().left : 0, u = c[0] ? c[0].y - o.$stage.offset().top : 0, d = function(e) {
            var i = r.opts[e];
            if (n.isFunction(i) && (i = i.apply(s, [r, t])),
            i)
                switch (i) {
                case "close":
                    s.close(o.startEvent);
                    break;
                case "toggleControls":
                    s.toggleControls(!0);
                    break;
                case "next":
                    s.next();
                    break;
                case "nextOrClose":
                    s.group.length > 1 ? s.next() : s.close(o.startEvent);
                    break;
                case "zoom":
                    "image" == r.type && (r.isLoaded || r.$ghost) && (s.canPan() ? s.scaleToFit() : s.isScaledDown() ? s.scaleToActual(l, u) : s.group.length < 2 && s.close(o.startEvent))
                }
        };
        if (!(t.originalEvent && 2 == t.originalEvent.button || s.isSliding || l > i[0].clientWidth + i.offset().left)) {
            if (i.is(".fancybox-bg,.fancybox-inner,.fancybox-outer,.fancybox-container"))
                e = "Outside";
            else if (i.is(".fancybox-slide"))
                e = "Slide";
            else {
                if (!s.current.$content || !s.current.$content.has(t.target).length)
                    return;
                e = "Content"
            }
            if (o.tapped) {
                if (clearTimeout(o.tapped),
                o.tapped = null,
                Math.abs(l - o.tapX) > 50 || Math.abs(u - o.tapY) > 50 || s.isSliding)
                    return this;
                d("dblclick" + e)
            } else
                o.tapX = l,
                o.tapY = u,
                r.opts["dblclick" + e] && r.opts["dblclick" + e] !== r.opts["click" + e] ? o.tapped = setTimeout(function() {
                    o.tapped = null,
                    d("click" + e)
                }, 300) : d("click" + e);
            return this
        }
    }
    ,
    n(e).on("onActivate.fb", function(t, e) {
        e && !e.Guestures && (e.Guestures = new u(e))
    }),
    n(e).on("beforeClose.fb", function(t, e) {
        e && e.Guestures && e.Guestures.destroy()
    })
}(window, document, window.jQuery),
function(t, e) {
    "use strict";
    var n = function(t) {
        this.instance = t,
        this.init()
    };
    e.extend(n.prototype, {
        timer: null,
        isActive: !1,
        $button: null,
        speed: 3e3,
        init: function() {
            var t = this;
            t.$button = t.instance.$refs.toolbar.find("[data-fancybox-play]").on("click", function() {
                t.toggle()
            }),
            (t.instance.group.length < 2 || !t.instance.group[t.instance.currIndex].opts.slideShow) && t.$button.hide()
        },
        set: function() {
            var t = this;
            t.instance && t.instance.current && (t.instance.current.opts.loop || t.instance.currIndex < t.instance.group.length - 1) ? t.timer = setTimeout(function() {
                t.instance.next()
            }, t.instance.current.opts.slideShow.speed || t.speed) : (t.stop(),
            t.instance.idleSecondsCounter = 0,
            t.instance.showControls())
        },
        clear: function() {
            var t = this;
            clearTimeout(t.timer),
            t.timer = null
        },
        start: function() {
            var t = this
              , e = t.instance.current;
            t.instance && e && (e.opts.loop || e.index < t.instance.group.length - 1) && (t.isActive = !0,
            t.$button.attr("title", e.opts.i18n[e.opts.lang].PLAY_STOP).addClass("fancybox-button--pause"),
            e.isComplete && t.set())
        },
        stop: function() {
            var t = this
              , e = t.instance.current;
            t.clear(),
            t.$button.attr("title", e.opts.i18n[e.opts.lang].PLAY_START).removeClass("fancybox-button--pause"),
            t.isActive = !1
        },
        toggle: function() {
            var t = this;
            t.isActive ? t.stop() : t.start()
        }
    }),
    e(t).on({
        "onInit.fb": function(t, e) {
            e && !e.SlideShow && (e.SlideShow = new n(e))
        },
        "beforeShow.fb": function(t, e, n, o) {
            var i = e && e.SlideShow;
            o ? i && n.opts.slideShow.autoStart && i.start() : i && i.isActive && i.clear()
        },
        "afterShow.fb": function(t, e, n) {
            var o = e && e.SlideShow;
            o && o.isActive && o.set()
        },
        "afterKeydown.fb": function(n, o, i, a, s) {
            var r = o && o.SlideShow;
            !r || !i.opts.slideShow || 80 !== s && 32 !== s || e(t.activeElement).is("button,a,input") || (a.preventDefault(),
            r.toggle())
        },
        "beforeClose.fb onDeactivate.fb": function(t, e) {
            var n = e && e.SlideShow;
            n && n.stop()
        }
    }),
    e(t).on("visibilitychange", function() {
        var n = e.fancybox.getInstance()
          , o = n && n.SlideShow;
        o && o.isActive && (t.hidden ? o.clear() : o.set())
    })
}(document, window.jQuery),
function(t, e) {
    "use strict";
    var n = function() {
        var e, n, o, i = [["requestFullscreen", "exitFullscreen", "fullscreenElement", "fullscreenEnabled", "fullscreenchange", "fullscreenerror"], ["webkitRequestFullscreen", "webkitExitFullscreen", "webkitFullscreenElement", "webkitFullscreenEnabled", "webkitfullscreenchange", "webkitfullscreenerror"], ["webkitRequestFullScreen", "webkitCancelFullScreen", "webkitCurrentFullScreenElement", "webkitCancelFullScreen", "webkitfullscreenchange", "webkitfullscreenerror"], ["mozRequestFullScreen", "mozCancelFullScreen", "mozFullScreenElement", "mozFullScreenEnabled", "mozfullscreenchange", "mozfullscreenerror"], ["msRequestFullscreen", "msExitFullscreen", "msFullscreenElement", "msFullscreenEnabled", "MSFullscreenChange", "MSFullscreenError"]], a = {};
        for (n = 0; n < i.length; n++)
            if (e = i[n],
            e && e[1]in t) {
                for (o = 0; o < e.length; o++)
                    a[i[0][o]] = e[o];
                return a
            }
        return !1
    }();
    if (!n)
        return void (e.fancybox.defaults.btnTpl.fullScreen = !1);
    var o = {
        request: function(e) {
            e = e || t.documentElement,
            e[n.requestFullscreen](e.ALLOW_KEYBOARD_INPUT)
        },
        exit: function() {
            t[n.exitFullscreen]()
        },
        toggle: function(e) {
            e = e || t.documentElement,
            this.isFullscreen() ? this.exit() : this.request(e)
        },
        isFullscreen: function() {
            return Boolean(t[n.fullscreenElement])
        },
        enabled: function() {
            return Boolean(t[n.fullscreenEnabled])
        }
    };
    e(t).on({
        "onInit.fb": function(t, e) {
            var n, i = e.$refs.toolbar.find("[data-fancybox-fullscreen]");
            e && !e.FullScreen && e.group[e.currIndex].opts.fullScreen ? (n = e.$refs.container,
            n.on("click.fb-fullscreen", "[data-fancybox-fullscreen]", function(t) {
                t.stopPropagation(),
                t.preventDefault(),
                o.toggle(n[0])
            }),
            e.opts.fullScreen && e.opts.fullScreen.autoStart === !0 && o.request(n[0]),
            e.FullScreen = o) : i.hide()
        },
        "afterKeydown.fb": function(t, e, n, o, i) {
            e && e.FullScreen && 70 === i && (o.preventDefault(),
            e.FullScreen.toggle(e.$refs.container[0]))
        },
        "beforeClose.fb": function(t) {
            t && t.FullScreen && o.exit()
        }
    }),
    e(t).on(n.fullscreenchange, function() {
        var t = e.fancybox.getInstance();
        t.current && "image" === t.current.type && t.isAnimating && (t.current.$content.css("transition", "none"),
        t.isAnimating = !1,
        t.update(!0, !0, 0))
    })
}(document, window.jQuery),
function(t, e) {
    "use strict";
    var n = function(t) {
        this.instance = t,
        this.init()
    };
    e.extend(n.prototype, {
        $button: null,
        $grid: null,
        $list: null,
        isVisible: !1,
        init: function() {
            var t = this
              , e = t.instance.group[0]
              , n = t.instance.group[1];
            t.$button = t.instance.$refs.toolbar.find("[data-fancybox-thumbs]"),
            t.instance.group.length > 1 && t.instance.group[t.instance.currIndex].opts.thumbs && ("image" == e.type || e.opts.thumb || e.opts.$thumb) && ("image" == n.type || n.opts.thumb || n.opts.$thumb) ? (t.$button.on("click", function() {
                t.toggle()
            }),
            t.isActive = !0) : (t.$button.hide(),
            t.isActive = !1)
        },
        create: function() {
            var t, n, o = this.instance;
            this.$grid = e('<div class="fancybox-thumbs"></div>').appendTo(o.$refs.container),
            t = "<ul>",
            e.each(o.group, function(e, o) {
                n = o.opts.thumb || (o.opts.$thumb ? o.opts.$thumb.attr("src") : null),
                n || "image" !== o.type || (n = o.src),
                n && n.length && (t += '<li data-index="' + e + '"  tabindex="0" class="fancybox-thumbs-loading"><img data-src="' + n + '" /></li>')
            }),
            t += "</ul>",
            this.$list = e(t).appendTo(this.$grid).on("click", "li", function() {
                o.jumpTo(e(this).data("index"))
            }),
            this.$list.find("img").hide().one("load", function() {
                var t, n, o, i, a = e(this).parent().removeClass("fancybox-thumbs-loading"), s = a.outerWidth(), r = a.outerHeight();
                t = this.naturalWidth || this.width,
                n = this.naturalHeight || this.height,
                o = t / s,
                i = n / r,
                o >= 1 && i >= 1 && (o > i ? (t /= i,
                n = r) : (t = s,
                n /= o)),
                e(this).css({
                    width: Math.floor(t),
                    height: Math.floor(n),
                    "margin-top": Math.min(0, Math.floor(.3 * r - .3 * n)),
                    "margin-left": Math.min(0, Math.floor(.5 * s - .5 * t))
                }).show()
            }).each(function() {
                this.src = e(this).data("src")
            })
        },
        focus: function() {
            this.instance.current && this.$list.children().removeClass("fancybox-thumbs-active").filter('[data-index="' + this.instance.current.index + '"]').addClass("fancybox-thumbs-active").focus()
        },
        close: function() {
            this.$grid.hide()
        },
        update: function() {
            this.instance.$refs.container.toggleClass("fancybox-show-thumbs", this.isVisible),
            this.isVisible ? (this.$grid || this.create(),
            this.instance.trigger("onThumbsShow"),
            this.focus()) : this.$grid && this.instance.trigger("onThumbsHide"),
            this.instance.update()
        },
        hide: function() {
            this.isVisible = !1,
            this.update()
        },
        show: function() {
            this.isVisible = !0,
            this.update()
        },
        toggle: function() {
            this.isVisible = !this.isVisible,
            this.update()
        }
    }),
    e(t).on({
        "onInit.fb": function(t, e) {
            e && !e.Thumbs && (e.Thumbs = new n(e))
        },
        "beforeShow.fb": function(t, e, n, o) {
            var i = e && e.Thumbs;
            if (i && i.isActive) {
                if (n.modal)
                    return i.$button.hide(),
                    void i.hide();
                o && e.opts.thumbs.autoStart === !0 && i.show(),
                i.isVisible && i.focus()
            }
        },
        "afterKeydown.fb": function(t, e, n, o, i) {
            var a = e && e.Thumbs;
            a && a.isActive && 71 === i && (o.preventDefault(),
            a.toggle())
        },
        "beforeClose.fb": function(t, e) {
            var n = e && e.Thumbs;
            n && n.isVisible && e.opts.thumbs.hideOnClose !== !1 && n.close()
        }
    })
}(document, window.jQuery),
function(t, e, n) {
    "use strict";
    function o() {
        var t = e.location.hash.substr(1)
          , n = t.split("-")
          , o = n.length > 1 && /^\+?\d+$/.test(n[n.length - 1]) ? parseInt(n.pop(-1), 10) || 1 : 1
          , i = n.join("-");
        return o < 1 && (o = 1),
        {
            hash: t,
            index: o,
            gallery: i
        }
    }
    function i(t) {
        var e;
        "" !== t.gallery && (e = n("[data-fancybox='" + n.escapeSelector(t.gallery) + "']").eq(t.index - 1),
        e.length ? e.trigger("click") : n("#" + n.escapeSelector(t.gallery)).trigger("click"))
    }
    function a(t) {
        var e;
        return !!t && (e = t.current ? t.current.opts : t.opts,
        e.$orig ? e.$orig.data("fancybox") : e.hash || "")
    }
    n.escapeSelector || (n.escapeSelector = function(t) {
        var e = /([\0-\x1f\x7f]|^-?\d)|^-$|[^\x80-\uFFFF\w-]/g
          , n = function(t, e) {
            return e ? "\0" === t ? "�" : t.slice(0, -1) + "\\" + t.charCodeAt(t.length - 1).toString(16) + " " : "\\" + t
        };
        return (t + "").replace(e, n)
    }
    );
    var s = null
      , r = null;
    n(function() {
        setTimeout(function() {
            n.fancybox.defaults.hash !== !1 && (n(t).on({
                "onInit.fb": function(t, e) {
                    var n, i;
                    e.group[e.currIndex].opts.hash !== !1 && (n = o(),
                    i = a(e),
                    i && n.gallery && i == n.gallery && (e.currIndex = n.index - 1))
                },
                "beforeShow.fb": function(n, o, i, c) {
                    var l;
                    i.opts.hash !== !1 && (l = a(o),
                    l && "" !== l && (e.location.hash.indexOf(l) < 0 && (o.opts.origHash = e.location.hash),
                    s = l + (o.group.length > 1 ? "-" + (i.index + 1) : ""),
                    "replaceState"in e.history ? (r && clearTimeout(r),
                    r = setTimeout(function() {
                        e.history[c ? "pushState" : "replaceState"]({}, t.title, e.location.pathname + e.location.search + "#" + s),
                        r = null
                    }, 300)) : e.location.hash = s))
                },
                "beforeClose.fb": function(o, i, c) {
                    var l, u;
                    r && clearTimeout(r),
                    c.opts.hash !== !1 && (l = a(i),
                    u = i && i.opts.origHash ? i.opts.origHash : "",
                    l && "" !== l && ("replaceState"in history ? e.history.replaceState({}, t.title, e.location.pathname + e.location.search + u) : (e.location.hash = u,
                    n(e).scrollTop(i.scrollTop).scrollLeft(i.scrollLeft))),
                    s = null)
                }
            }),
            n(e).on("hashchange.fb", function() {
                var t = o();
                n.fancybox.getInstance() ? !s || s === t.gallery + "-" + t.index || 1 === t.index && s == t.gallery || (s = null,
                n.fancybox.close()) : "" !== t.gallery && i(t)
            }),
            n(e).one("unload.fb popstate.fb", function() {
                n.fancybox.getInstance("close", !0, 0)
            }),
            i(o()))
        }, 50)
    })
}(document, window, window.jQuery);
;(function($) {
    $.fn.initGalleryFancybox = function() {
        $('a.fancy-gallery', this).fancybox({
            caption: function(instance, item) {
                var slideInfo = $('.slide-info', this);
                if ($('> *', slideInfo).length) {
                    return slideInfo.clone().html();
                }
            },
            onInit: function(instance) {
                instance.$refs.caption.addClass('fancybox-title');
                instance.$refs.caption.parent().addClass('slideinfo');
            }
        });
    }
    ;
    $.fn.initPortfolioFancybox = function() {
        $('a.fancy, .fancy-link-inner a', this).fancybox();
        $('.portfolio-item a.vimeo, .portfolio-item a.youtube', this).fancybox({
            type: 'iframe'
        });
        $('.portfolio-item a.self_video', this).click(function(e) {
            e.preventDefault();
            var $a = $(this);
            $.fancybox.open({
                type: 'html',
                maxWidth: 1200,
                content: '<div id="fancybox-video"><video width="100%" height="100%" autoplay="autoplay" controls="controls" src="' + $a.attr('href') + '" preload="none"></video></div>',
                afterShow: function(instance, current) {
                    $('video', current.$content).mediaelementplayer();
                }
            });
        });
    }
    ;
    $.fn.initBlogFancybox = function() {
        $('a.fancy, .fancy-link-inner a', this).fancybox();
        $('.blog article a.youtube, .blog article a.vimeo', this).fancybox({
            type: 'iframe'
        });
    }
    ;
    $(document).initGalleryFancybox();
    $(document).initPortfolioFancybox();
    $(document).initBlogFancybox();
    $('a.fancy, .fancy-link-inner a').fancybox();
}
)(jQuery);
;(function($) {
    'use strict';
    if (typeof wpcf7 === 'undefined' || wpcf7 === null) {
        return;
    }
    wpcf7 = $.extend({
        cached: 0,
        inputs: []
    }, wpcf7);
    $(function() {
        wpcf7.supportHtml5 = (function() {
            var features = {};
            var input = document.createElement('input');
            features.placeholder = 'placeholder'in input;
            var inputTypes = ['email', 'url', 'tel', 'number', 'range', 'date'];
            $.each(inputTypes, function(index, value) {
                input.setAttribute('type', value);
                features[value] = input.type !== 'text';
            });
            return features;
        }
        )();
        $('div.wpcf7 > form').each(function() {
            var $form = $(this);
            wpcf7.initForm($form);
            if (wpcf7.cached) {
                wpcf7.refill($form);
            }
        });
    });
    wpcf7.getId = function(form) {
        return parseInt($('input[name="_wpcf7"]', form).val(), 10);
    }
    ;
    wpcf7.initForm = function(form) {
        var $form = $(form);
        $form.submit(function(event) {
            if (!wpcf7.supportHtml5.placeholder) {
                $('[placeholder].placeheld', $form).each(function(i, n) {
                    $(n).val('').removeClass('placeheld');
                });
            }
            if (typeof window.FormData === 'function') {
                wpcf7.submit($form);
                event.preventDefault();
            }
        });
        $('.wpcf7-submit', $form).after('<span class="ajax-loader"></span>');
        wpcf7.toggleSubmit($form);
        $form.on('click', '.wpcf7-acceptance', function() {
            wpcf7.toggleSubmit($form);
        });
        $('.wpcf7-exclusive-checkbox', $form).on('click', 'input:checkbox', function() {
            var name = $(this).attr('name');
            $form.find('input:checkbox[name="' + name + '"]').not(this).prop('checked', false);
        });
        $('.wpcf7-list-item.has-free-text', $form).each(function() {
            var $freetext = $(':input.wpcf7-free-text', this);
            var $wrap = $(this).closest('.wpcf7-form-control');
            if ($(':checkbox, :radio', this).is(':checked')) {
                $freetext.prop('disabled', false);
            } else {
                $freetext.prop('disabled', true);
            }
            $wrap.on('change', ':checkbox, :radio', function() {
                var $cb = $('.has-free-text', $wrap).find(':checkbox, :radio');
                if ($cb.is(':checked')) {
                    $freetext.prop('disabled', false).focus();
                } else {
                    $freetext.prop('disabled', true);
                }
            });
        });
        if (!wpcf7.supportHtml5.placeholder) {
            $('[placeholder]', $form).each(function() {
                $(this).val($(this).attr('placeholder'));
                $(this).addClass('placeheld');
                $(this).focus(function() {
                    if ($(this).hasClass('placeheld')) {
                        $(this).val('').removeClass('placeheld');
                    }
                });
                $(this).blur(function() {
                    if ('' === $(this).val()) {
                        $(this).val($(this).attr('placeholder'));
                        $(this).addClass('placeheld');
                    }
                });
            });
        }
        if (wpcf7.jqueryUi && !wpcf7.supportHtml5.date) {
            $form.find('input.wpcf7-date[type="date"]').each(function() {
                $(this).datepicker({
                    dateFormat: 'yy-mm-dd',
                    minDate: new Date($(this).attr('min')),
                    maxDate: new Date($(this).attr('max'))
                });
            });
        }
        if (wpcf7.jqueryUi && !wpcf7.supportHtml5.number) {
            $form.find('input.wpcf7-number[type="number"]').each(function() {
                $(this).spinner({
                    min: $(this).attr('min'),
                    max: $(this).attr('max'),
                    step: $(this).attr('step')
                });
            });
        }
        $('.wpcf7-character-count', $form).each(function() {
            var $count = $(this);
            var name = $count.attr('data-target-name');
            var down = $count.hasClass('down');
            var starting = parseInt($count.attr('data-starting-value'), 10);
            var maximum = parseInt($count.attr('data-maximum-value'), 10);
            var minimum = parseInt($count.attr('data-minimum-value'), 10);
            var updateCount = function(target) {
                var $target = $(target);
                var length = $target.val().length;
                var count = down ? starting - length : length;
                $count.attr('data-current-value', count);
                $count.text(count);
                if (maximum && maximum < length) {
                    $count.addClass('too-long');
                } else {
                    $count.removeClass('too-long');
                }
                if (minimum && length < minimum) {
                    $count.addClass('too-short');
                } else {
                    $count.removeClass('too-short');
                }
            };
            $(':input[name="' + name + '"]', $form).each(function() {
                updateCount(this);
                $(this).keyup(function() {
                    updateCount(this);
                });
            });
        });
        $form.on('change', '.wpcf7-validates-as-url', function() {
            var val = $.trim($(this).val());
            if (val && !val.match(/^[a-z][a-z0-9.+-]*:/i) && -1 !== val.indexOf('.')) {
                val = val.replace(/^\/+/, '');
                val = 'http://' + val;
            }
            $(this).val(val);
        });
    }
    ;
    wpcf7.submit = function(form) {
        if (typeof window.FormData !== 'function') {
            return;
        }
        var $form = $(form);
        $('.ajax-loader', $form).addClass('is-active');
        wpcf7.clearResponse($form);
        var formData = new FormData($form.get(0));
        var detail = {
            id: $form.closest('div.wpcf7').attr('id'),
            status: 'init',
            inputs: [],
            formData: formData
        };
        $.each($form.serializeArray(), function(i, field) {
            if ('_wpcf7' == field.name) {
                detail.contactFormId = field.value;
            } else if ('_wpcf7_version' == field.name) {
                detail.pluginVersion = field.value;
            } else if ('_wpcf7_locale' == field.name) {
                detail.contactFormLocale = field.value;
            } else if ('_wpcf7_unit_tag' == field.name) {
                detail.unitTag = field.value;
            } else if ('_wpcf7_container_post' == field.name) {
                detail.containerPostId = field.value;
            } else if (field.name.match(/^_wpcf7_\w+_free_text_/)) {
                var owner = field.name.replace(/^_wpcf7_\w+_free_text_/, '');
                detail.inputs.push({
                    name: owner + '-free-text',
                    value: field.value
                });
            } else if (field.name.match(/^_/)) {} else {
                detail.inputs.push(field);
            }
        });
        wpcf7.triggerEvent($form.closest('div.wpcf7'), 'beforesubmit', detail);
        var ajaxSuccess = function(data, status, xhr, $form) {
            detail.id = $(data.into).attr('id');
            detail.status = data.status;
            detail.apiResponse = data;
            var $message = $('.wpcf7-response-output', $form);
            switch (data.status) {
            case 'validation_failed':
                $.each(data.invalidFields, function(i, n) {
                    $(n.into, $form).each(function() {
                        wpcf7.notValidTip(this, n.message);
                        $('.wpcf7-form-control', this).addClass('wpcf7-not-valid');
                        $('[aria-invalid]', this).attr('aria-invalid', 'true');
                    });
                });
                $message.addClass('wpcf7-validation-errors');
                $form.addClass('invalid');
                wpcf7.triggerEvent(data.into, 'invalid', detail);
                break;
            case 'acceptance_missing':
                $message.addClass('wpcf7-acceptance-missing');
                $form.addClass('unaccepted');
                wpcf7.triggerEvent(data.into, 'unaccepted', detail);
                break;
            case 'spam':
                $message.addClass('wpcf7-spam-blocked');
                $form.addClass('spam');
                wpcf7.triggerEvent(data.into, 'spam', detail);
                break;
            case 'aborted':
                $message.addClass('wpcf7-aborted');
                $form.addClass('aborted');
                wpcf7.triggerEvent(data.into, 'aborted', detail);
                break;
            case 'mail_sent':
                $message.addClass('wpcf7-mail-sent-ok');
                $form.addClass('sent');
                wpcf7.triggerEvent(data.into, 'mailsent', detail);
                break;
            case 'mail_failed':
                $message.addClass('wpcf7-mail-sent-ng');
                $form.addClass('failed');
                wpcf7.triggerEvent(data.into, 'mailfailed', detail);
                break;
            default:
                var customStatusClass = 'custom-' + data.status.replace(/[^0-9a-z]+/i, '-');
                $message.addClass('wpcf7-' + customStatusClass);
                $form.addClass(customStatusClass);
            }
            wpcf7.refill($form, data);
            wpcf7.triggerEvent(data.into, 'submit', detail);
            if ('mail_sent' == data.status) {
                $form.each(function() {
                    this.reset();
                });
                wpcf7.toggleSubmit($form);
            }
            if (!wpcf7.supportHtml5.placeholder) {
                $form.find('[placeholder].placeheld').each(function(i, n) {
                    $(n).val($(n).attr('placeholder'));
                });
            }
            $message.html('').append(data.message).slideDown('fast');
            $message.attr('role', 'alert');
            $('.screen-reader-response', $form.closest('.wpcf7')).each(function() {
                var $response = $(this);
                $response.html('').attr('role', '').append(data.message);
                if (data.invalidFields) {
                    var $invalids = $('<ul></ul>');
                    $.each(data.invalidFields, function(i, n) {
                        if (n.idref) {
                            var $li = $('<li></li>').append($('<a></a>').attr('href', '#' + n.idref).append(n.message));
                        } else {
                            var $li = $('<li></li>').append(n.message);
                        }
                        $invalids.append($li);
                    });
                    $response.append($invalids);
                }
                $response.attr('role', 'alert').focus();
            });
        };
        $.ajax({
            type: 'POST',
            url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/feedback'),
            data: formData,
            dataType: 'json',
            processData: false,
            contentType: false
        }).done(function(data, status, xhr) {
            ajaxSuccess(data, status, xhr, $form);
            $('.ajax-loader', $form).removeClass('is-active');
        }).fail(function(xhr, status, error) {
            var $e = $('<div class="ajax-error"></div>').text(error.message);
            $form.after($e);
        });
    }
    ;
    wpcf7.triggerEvent = function(target, name, detail) {
        var $target = $(target);
        var event = new CustomEvent('wpcf7' + name,{
            bubbles: true,
            detail: detail
        });
        $target.get(0).dispatchEvent(event);
        $target.trigger('wpcf7:' + name, detail);
        $target.trigger(name + '.wpcf7', detail);
    }
    ;
    wpcf7.toggleSubmit = function(form, state) {
        var $form = $(form);
        var $submit = $('input:submit', $form);
        if (typeof state !== 'undefined') {
            $submit.prop('disabled', !state);
            return;
        }
        if ($form.hasClass('wpcf7-acceptance-as-validation')) {
            return;
        }
        $submit.prop('disabled', false);
        $('.wpcf7-acceptance', $form).each(function() {
            var $span = $(this);
            var $input = $('input:checkbox', $span);
            if (!$span.hasClass('optional')) {
                if ($span.hasClass('invert') && $input.is(':checked') || !$span.hasClass('invert') && !$input.is(':checked')) {
                    $submit.prop('disabled', true);
                    return false;
                }
            }
        });
    }
    ;
    wpcf7.notValidTip = function(target, message) {
        var $target = $(target);
        $('.wpcf7-not-valid-tip', $target).remove();
        $('<span role="alert" class="wpcf7-not-valid-tip"></span>').text(message).appendTo($target);
        if ($target.is('.use-floating-validation-tip *')) {
            var fadeOut = function(target) {
                $(target).not(':hidden').animate({
                    opacity: 0
                }, 'fast', function() {
                    $(this).css({
                        'z-index': -100
                    });
                });
            };
            $target.on('mouseover', '.wpcf7-not-valid-tip', function() {
                fadeOut(this);
            });
            $target.on('focus', ':input', function() {
                fadeOut($('.wpcf7-not-valid-tip', $target));
            });
        }
    }
    ;
    wpcf7.refill = function(form, data) {
        var $form = $(form);
        var refillCaptcha = function($form, items) {
            $.each(items, function(i, n) {
                $form.find(':input[name="' + i + '"]').val('');
                $form.find('img.wpcf7-captcha-' + i).attr('src', n);
                var match = /([0-9]+)\.(png|gif|jpeg)$/.exec(n);
                $form.find('input:hidden[name="_wpcf7_captcha_challenge_' + i + '"]').attr('value', match[1]);
            });
        };
        var refillQuiz = function($form, items) {
            $.each(items, function(i, n) {
                $form.find(':input[name="' + i + '"]').val('');
                $form.find(':input[name="' + i + '"]').siblings('span.wpcf7-quiz-label').text(n[0]);
                $form.find('input:hidden[name="_wpcf7_quiz_answer_' + i + '"]').attr('value', n[1]);
            });
        };
        if (typeof data === 'undefined') {
            $.ajax({
                type: 'GET',
                url: wpcf7.apiSettings.getRoute('/contact-forms/' + wpcf7.getId($form) + '/refill'),
                beforeSend: function(xhr) {
                    var nonce = $form.find(':input[name="_wpnonce"]').val();
                    if (nonce) {
                        xhr.setRequestHeader('X-WP-Nonce', nonce);
                    }
                },
                dataType: 'json'
            }).done(function(data, status, xhr) {
                if (data.captcha) {
                    refillCaptcha($form, data.captcha);
                }
                if (data.quiz) {
                    refillQuiz($form, data.quiz);
                }
            });
        } else {
            if (data.captcha) {
                refillCaptcha($form, data.captcha);
            }
            if (data.quiz) {
                refillQuiz($form, data.quiz);
            }
        }
    }
    ;
    wpcf7.clearResponse = function(form) {
        var $form = $(form);
        $form.removeClass('invalid spam sent failed');
        $form.siblings('.screen-reader-response').html('').attr('role', '');
        $('.wpcf7-not-valid-tip', $form).remove();
        $('[aria-invalid]', $form).attr('aria-invalid', 'false');
        $('.wpcf7-form-control', $form).removeClass('wpcf7-not-valid');
        $('.wpcf7-response-output', $form).hide().empty().removeAttr('role').removeClass('wpcf7-mail-sent-ok wpcf7-mail-sent-ng wpcf7-validation-errors wpcf7-spam-blocked');
    }
    ;
    wpcf7.apiSettings.getRoute = function(path) {
        var url = wpcf7.apiSettings.root;
        url = url.replace(wpcf7.apiSettings.namespace, wpcf7.apiSettings.namespace + path);
        return url;
    }
    ;
}
)(jQuery);
(function() {
    if (typeof window.CustomEvent === "function")
        return false;
    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }
    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
}
)();
;!function(d, l) {
    "use strict";
    var e = !1
      , o = !1;
    if (l.querySelector)
        if (d.addEventListener)
            e = !0;
    if (d.wp = d.wp || {},
    !d.wp.receiveEmbedMessage)
        if (d.wp.receiveEmbedMessage = function(e) {
            var t = e.data;
            if (t)
                if (t.secret || t.message || t.value)
                    if (!/[^a-zA-Z0-9]/.test(t.secret)) {
                        var r, a, i, s, n, o = l.querySelectorAll('iframe[data-secret="' + t.secret + '"]'), c = l.querySelectorAll('blockquote[data-secret="' + t.secret + '"]');
                        for (r = 0; r < c.length; r++)
                            c[r].style.display = "none";
                        for (r = 0; r < o.length; r++)
                            if (a = o[r],
                            e.source === a.contentWindow) {
                                if (a.removeAttribute("style"),
                                "height" === t.message) {
                                    if (1e3 < (i = parseInt(t.value, 10)))
                                        i = 1e3;
                                    else if (~~i < 200)
                                        i = 200;
                                    a.height = i
                                }
                                if ("link" === t.message)
                                    if (s = l.createElement("a"),
                                    n = l.createElement("a"),
                                    s.href = a.getAttribute("src"),
                                    n.href = t.value,
                                    n.host === s.host)
                                        if (l.activeElement === a)
                                            d.top.location.href = t.value
                            }
                    }
        }
        ,
        e)
            d.addEventListener("message", d.wp.receiveEmbedMessage, !1),
            l.addEventListener("DOMContentLoaded", t, !1),
            d.addEventListener("load", t, !1);
    function t() {
        if (!o) {
            o = !0;
            var e, t, r, a, i = -1 !== navigator.appVersion.indexOf("MSIE 10"), s = !!navigator.userAgent.match(/Trident.*rv:11\./), n = l.querySelectorAll("iframe.wp-embedded-content");
            for (t = 0; t < n.length; t++) {
                if (!(r = n[t]).getAttribute("data-secret"))
                    a = Math.random().toString(36).substr(2, 10),
                    r.src += "#?secret=" + a,
                    r.setAttribute("data-secret", a);
                if (i || s)
                    (e = r.cloneNode(!0)).removeAttribute("security"),
                    r.parentNode.replaceChild(e, r)
            }
        }
    }
}(window, document);
;/*!
 * WPBakery Page Builder v6.0.0 (https://wpbakery.com)
 * Copyright 2011-2019 Michael M, WPBakery
 * License: Commercial. More details: http://go.wpbakery.com/licensing
 */

// jscs:disable
// jshint ignore: start

document.documentElement.className += " js_active ",
document.documentElement.className += "ontouchstart"in document.documentElement ? " vc_mobile " : " vc_desktop ",
function() {
    for (var prefix = ["-webkit-", "-moz-", "-ms-", "-o-", ""], i = 0; i < prefix.length; i++)
        prefix[i] + "transform"in document.documentElement.style && (document.documentElement.className += " vc_transform ")
}(),
function($) {
    "function" != typeof window.vc_js && (window.vc_js = function() {
        "use strict";
        vc_toggleBehaviour(),
        vc_tabsBehaviour(),
        vc_accordionBehaviour(),
        vc_teaserGrid(),
        vc_carouselBehaviour(),
        vc_slidersBehaviour(),
        vc_prettyPhoto(),
        vc_pinterest(),
        vc_progress_bar(),
        vc_plugin_flexslider(),
        vc_gridBehaviour(),
        vc_rowBehaviour(),
        vc_prepareHoverBox(),
        vc_googleMapsPointer(),
        vc_ttaActivation(),
        jQuery(document).trigger("vc_js"),
        window.setTimeout(vc_waypoints, 500)
    }
    ),
    "function" != typeof window.vc_plugin_flexslider && (window.vc_plugin_flexslider = function($parent) {
        ($parent ? $parent.find(".wpb_flexslider") : jQuery(".wpb_flexslider")).each(function() {
            var this_element = jQuery(this)
              , sliderTimeout = 1e3 * parseInt(this_element.attr("data-interval"), 10)
              , sliderFx = this_element.attr("data-flex_fx")
              , slideshow = !0;
            0 === sliderTimeout && (slideshow = !1),
            this_element.is(":visible") && this_element.flexslider({
                animation: sliderFx,
                slideshow: slideshow,
                slideshowSpeed: sliderTimeout,
                sliderSpeed: 800,
                smoothHeight: !0
            })
        })
    }
    ),
    "function" != typeof window.vc_googleplus && (window.vc_googleplus = function() {
        0 < jQuery(".wpb_googleplus").length && function() {
            var po = document.createElement("script");
            po.type = "text/javascript",
            po.async = !0,
            po.src = "https://apis.google.com/js/plusone.js";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(po, s)
        }()
    }
    ),
    "function" != typeof window.vc_pinterest && (window.vc_pinterest = function() {
        0 < jQuery(".wpb_pinterest").length && function() {
            var po = document.createElement("script");
            po.type = "text/javascript",
            po.async = !0,
            po.src = "https://assets.pinterest.com/js/pinit.js";
            var s = document.getElementsByTagName("script")[0];
            s.parentNode.insertBefore(po, s)
        }()
    }
    ),
    "function" != typeof window.vc_progress_bar && (window.vc_progress_bar = function() {
        void 0 !== jQuery.fn.vcwaypoint && jQuery(".vc_progress_bar").each(function() {
            var $el = jQuery(this);
            $el.vcwaypoint(function() {
                $el.find(".vc_single_bar").each(function(index) {
                    var bar = jQuery(this).find(".vc_bar")
                      , val = bar.data("percentage-value");
                    setTimeout(function() {
                        bar.css({
                            width: val + "%"
                        })
                    }, 200 * index)
                })
            }, {
                offset: "85%"
            })
        })
    }
    ),
    "function" != typeof window.vc_waypoints && (window.vc_waypoints = function() {
        void 0 !== jQuery.fn.vcwaypoint && jQuery(".wpb_animate_when_almost_visible:not(.wpb_start_animation)").each(function() {
            var $el = jQuery(this);
            $el.vcwaypoint(function() {
                $el.addClass("wpb_start_animation animated")
            }, {
                offset: "85%"
            })
        })
    }
    ),
    "function" != typeof window.vc_toggleBehaviour && (window.vc_toggleBehaviour = function($el) {
        function event(e) {
            e && e.preventDefault && e.preventDefault();
            var element = jQuery(this).closest(".vc_toggle")
              , content = element.find(".vc_toggle_content");
            element.hasClass("vc_toggle_active") ? content.slideUp({
                duration: 300,
                complete: function() {
                    element.removeClass("vc_toggle_active")
                }
            }) : content.slideDown({
                duration: 300,
                complete: function() {
                    element.addClass("vc_toggle_active")
                }
            })
        }
        $el ? $el.hasClass("vc_toggle_title") ? $el.unbind("click").on("click", event) : $el.find(".vc_toggle_title").off("click").on("click", event) : jQuery(".vc_toggle_title").off("click").on("click", event)
    }
    ),
    "function" != typeof window.vc_tabsBehaviour && (window.vc_tabsBehaviour = function($tab) {
        if (jQuery.ui) {
            var $call = $tab || jQuery(".wpb_tabs, .wpb_tour")
              , ver = jQuery.ui && jQuery.ui.version ? jQuery.ui.version.split(".") : "1.10"
              , old_version = 1 === parseInt(ver[0], 10) && parseInt(ver[1], 10) < 9;
            $call.each(function(index) {
                var $tabs, interval = jQuery(this).attr("data-interval"), tabs_array = [];
                if ($tabs = jQuery(this).find(".wpb_tour_tabs_wrapper").tabs({
                    show: function(event, ui) {
                        wpb_prepare_tab_content(event, ui)
                    },
                    activate: function(event, ui) {
                        wpb_prepare_tab_content(event, ui)
                    }
                }),
                interval && 0 < interval)
                    try {
                        $tabs.tabs("rotate", 1e3 * interval)
                    } catch (err) {
                        window.console && window.console.warn && console.warn("tabs behaviours error", err)
                    }
                jQuery(this).find(".wpb_tab").each(function() {
                    tabs_array.push(this.id)
                }),
                jQuery(this).find(".wpb_tabs_nav li").on("click", function(e) {
                    return e && e.preventDefault && e.preventDefault(),
                    old_version ? $tabs.tabs("select", jQuery("a", this).attr("href")) : $tabs.tabs("option", "active", jQuery(this).index()),
                    !1
                }),
                jQuery(this).find(".wpb_prev_slide a, .wpb_next_slide a").on("click", function(e) {
                    var index, length;
                    e && e.preventDefault && e.preventDefault(),
                    old_version ? (index = $tabs.tabs("option", "selected"),
                    jQuery(this).parent().hasClass("wpb_next_slide") ? index++ : index--,
                    index < 0 ? index = $tabs.tabs("length") - 1 : index >= $tabs.tabs("length") && (index = 0),
                    $tabs.tabs("select", index)) : (index = $tabs.tabs("option", "active"),
                    length = $tabs.find(".wpb_tab").length,
                    index = jQuery(this).parent().hasClass("wpb_next_slide") ? length <= index + 1 ? 0 : index + 1 : index - 1 < 0 ? length - 1 : index - 1,
                    $tabs.tabs("option", "active", index))
                })
            })
        }
    }
    ),
    "function" != typeof window.vc_accordionBehaviour && (window.vc_accordionBehaviour = function() {
        jQuery(".wpb_accordion").each(function(index) {
            var $tabs, active_tab, collapsible, $this = jQuery(this);
            $this.attr("data-interval"),
            collapsible = !1 === (active_tab = !isNaN(jQuery(this).data("active-tab")) && 0 < parseInt($this.data("active-tab"), 10) && parseInt($this.data("active-tab"), 10) - 1) || "yes" === $this.data("collapsible"),
            $tabs = $this.find(".wpb_accordion_wrapper").accordion({
                header: "> div > h3",
                autoHeight: !1,
                heightStyle: "content",
                active: active_tab,
                collapsible: collapsible,
                navigation: !0,
                activate: vc_accordionActivate,
                change: function(event, ui) {
                    void 0 !== jQuery.fn.isotope && ui.newContent.find(".isotope").isotope("layout"),
                    vc_carouselBehaviour(ui.newPanel)
                }
            }),
            !0 === $this.data("vcDisableKeydown") && ($tabs.data("uiAccordion")._keydown = function() {}
            )
        })
    }
    ),
    "function" != typeof window.vc_teaserGrid && (window.vc_teaserGrid = function() {
        var layout_modes = {
            fitrows: "fitRows",
            masonry: "masonry"
        };
        jQuery(".wpb_grid .teaser_grid_container:not(.wpb_carousel), .wpb_filtered_grid .teaser_grid_container:not(.wpb_carousel)").each(function() {
            var $container = jQuery(this)
              , $thumbs = $container.find(".wpb_thumbnails")
              , layout_mode = $thumbs.attr("data-layout-mode");
            $thumbs.isotope({
                itemSelector: ".isotope-item",
                layoutMode: void 0 === layout_modes[layout_mode] ? "fitRows" : layout_modes[layout_mode]
            }),
            $container.find(".categories_filter a").data("isotope", $thumbs).on("click", function(e) {
                e && e.preventDefault && e.preventDefault();
                var $thumbs = jQuery(this).data("isotope");
                jQuery(this).parent().parent().find(".active").removeClass("active"),
                jQuery(this).parent().addClass("active"),
                $thumbs.isotope({
                    filter: jQuery(this).attr("data-filter")
                })
            }),
            jQuery(window).bind("load resize", function() {
                $thumbs.isotope("layout")
            })
        })
    }
    ),
    "function" != typeof window.vc_carouselBehaviour && (window.vc_carouselBehaviour = function($parent) {
        ($parent ? $parent.find(".wpb_carousel") : jQuery(".wpb_carousel")).each(function() {
            var $this = jQuery(this);
            if (!0 !== $this.data("carousel_enabled") && $this.is(":visible")) {
                $this.data("carousel_enabled", !0);
                getColumnsCount(jQuery(this));
                jQuery(this).hasClass("columns_count_1") && 900;
                var carousel_li = jQuery(this).find(".wpb_thumbnails-fluid li");
                carousel_li.css({
                    "margin-right": carousel_li.css("margin-left"),
                    "margin-left": 0
                });
                var fluid_ul = jQuery(this).find("ul.wpb_thumbnails-fluid");
                fluid_ul.width(fluid_ul.width() + 300),
                jQuery(window).on("resize", function() {
                    screen_size != (screen_size = getSizeName()) && window.setTimeout(function() {
                        location.reload()
                    }, 20)
                })
            }
        })
    }
    ),
    "function" != typeof window.vc_slidersBehaviour && (window.vc_slidersBehaviour = function() {
        jQuery(".wpb_gallery_slides").each(function(index) {
            var $imagesGrid, this_element = jQuery(this);
            if (this_element.hasClass("wpb_slider_nivo")) {
                var sliderTimeout = 1e3 * this_element.attr("data-interval");
                0 === sliderTimeout && (sliderTimeout = 9999999999),
                this_element.find(".nivoSlider").nivoSlider({
                    effect: "boxRainGrow,boxRain,boxRainReverse,boxRainGrowReverse",
                    slices: 15,
                    boxCols: 8,
                    boxRows: 4,
                    animSpeed: 800,
                    pauseTime: sliderTimeout,
                    startSlide: 0,
                    directionNav: !0,
                    directionNavHide: !0,
                    controlNav: !0,
                    keyboardNav: !1,
                    pauseOnHover: !0,
                    manualAdvance: !1,
                    prevText: "Prev",
                    nextText: "Next"
                })
            } else
                this_element.hasClass("wpb_image_grid") && (jQuery.fn.imagesLoaded ? $imagesGrid = this_element.find(".wpb_image_grid_ul").imagesLoaded(function() {
                    $imagesGrid.isotope({
                        itemSelector: ".isotope-item",
                        layoutMode: "fitRows"
                    })
                }) : this_element.find(".wpb_image_grid_ul").isotope({
                    itemSelector: ".isotope-item",
                    layoutMode: "fitRows"
                }))
        })
    }
    ),
    "function" != typeof window.vc_prettyPhoto && (window.vc_prettyPhoto = function() {
        try {
            jQuery && jQuery.fn && jQuery.fn.prettyPhoto && jQuery('a.prettyphoto, .gallery-icon a[href*=".jpg"]').prettyPhoto({
                animationSpeed: "normal",
                hook: "data-rel",
                padding: 15,
                opacity: .7,
                showTitle: !0,
                allowresize: !0,
                counter_separator_label: "/",
                hideflash: !1,
                deeplinking: !1,
                modal: !1,
                callback: function() {
                    -1 < location.href.indexOf("#!prettyPhoto") && (location.hash = "")
                },
                social_tools: ""
            })
        } catch (err) {
            window.console && window.console.warn && window.console.warn("vc_prettyPhoto initialize error", err)
        }
    }
    ),
    "function" != typeof window.vc_google_fonts && (window.vc_google_fonts = function() {
        return window.console && window.console.warn && window.console.warn("function vc_google_fonts is deprecated, no need to use it"),
        !1
    }
    ),
    window.vcParallaxSkroll = !1,
    "function" != typeof window.vc_rowBehaviour && (window.vc_rowBehaviour = function() {
        var vcSkrollrOptions, callSkrollInit, $ = window.jQuery;
        function fullWidthRow() {
            var $elements = $('[data-vc-full-width="true"]');
            $.each($elements, function(key, item) {
                var $el = $(this);
                $el.addClass("vc_hidden");
                var $el_full = $el.next(".vc_row-full-width");
                if ($el_full.length || ($el_full = $el.parent().next(".vc_row-full-width")),
                $el_full.length) {
                    var padding, paddingRight, el_margin_left = parseInt($el.css("margin-left"), 10), el_margin_right = parseInt($el.css("margin-right"), 10), offset = 0 - $el_full.offset().left - el_margin_left, width = $(window).width();
                    if ("rtl" === $el.css("direction") && (offset -= $el_full.width(),
                    offset += width,
                    offset += el_margin_left,
                    offset += el_margin_right),
                    $el.css({
                        position: "relative",
                        left: offset,
                        "box-sizing": "border-box",
                        width: width
                    }),
                    !$el.data("vcStretchContent"))
                        "rtl" === $el.css("direction") ? ((padding = offset) < 0 && (padding = 0),
                        (paddingRight = offset) < 0 && (paddingRight = 0)) : ((padding = -1 * offset) < 0 && (padding = 0),
                        (paddingRight = width - padding - $el_full.width() + el_margin_left + el_margin_right) < 0 && (paddingRight = 0)),
                        $el.css({
                            "padding-left": padding + "px",
                            "padding-right": paddingRight + "px"
                        });
                    $el.attr("data-vc-full-width-init", "true"),
                    $el.removeClass("vc_hidden"),
                    $(document).trigger("vc-full-width-row-single", {
                        el: $el,
                        offset: offset,
                        marginLeft: el_margin_left,
                        marginRight: el_margin_right,
                        elFull: $el_full,
                        width: width
                    })
                }
            }),
            $(document).trigger("vc-full-width-row", $elements)
        }
        function fullHeightRow() {
            var windowHeight, offsetTop, fullHeight, $element = $(".vc_row-o-full-height:first");
            $element.length && (windowHeight = $(window).height(),
            (offsetTop = $element.offset().top) < windowHeight && (fullHeight = 100 - offsetTop / (windowHeight / 100),
            $element.css("min-height", fullHeight + "vh")));
            $(document).trigger("vc-full-height-row", $element)
        }
        $(window).off("resize.vcRowBehaviour").on("resize.vcRowBehaviour", fullWidthRow).on("resize.vcRowBehaviour", fullHeightRow),
        fullWidthRow(),
        fullHeightRow(),
        (0 < window.navigator.userAgent.indexOf("MSIE ") || navigator.userAgent.match(/Trident.*rv\:11\./)) && $(".vc_row-o-full-height").each(function() {
            "flex" === $(this).css("display") && $(this).wrap('<div class="vc_ie-flexbox-fixer"></div>')
        }),
        vc_initVideoBackgrounds(),
        callSkrollInit = !1,
        window.vcParallaxSkroll && window.vcParallaxSkroll.destroy(),
        $(".vc_parallax-inner").remove(),
        $("[data-5p-top-bottom]").removeAttr("data-5p-top-bottom data-30p-top-bottom"),
        $("[data-vc-parallax]").each(function() {
            var skrollrSize, skrollrStart, $parallaxElement, parallaxImage, youtubeId;
            callSkrollInit = !0,
            "on" === $(this).data("vcParallaxOFade") && $(this).children().attr("data-5p-top-bottom", "opacity:0;").attr("data-30p-top-bottom", "opacity:1;"),
            skrollrSize = 100 * $(this).data("vcParallax"),
            ($parallaxElement = $("<div />").addClass("vc_parallax-inner").appendTo($(this))).height(skrollrSize + "%"),
            parallaxImage = $(this).data("vcParallaxImage"),
            (youtubeId = vcExtractYoutubeId(parallaxImage)) ? insertYoutubeVideoAsBackground($parallaxElement, youtubeId) : void 0 !== parallaxImage && $parallaxElement.css("background-image", "url(" + parallaxImage + ")"),
            skrollrStart = -(skrollrSize - 100),
            $parallaxElement.attr("data-bottom-top", "top: " + skrollrStart + "%;").attr("data-top-bottom", "top: 0%;")
        }),
        callSkrollInit && window.skrollr && (vcSkrollrOptions = {
            forceHeight: !1,
            smoothScrolling: !1,
            mobileCheck: function() {
                return !1
            }
        },
        window.vcParallaxSkroll = skrollr.init(vcSkrollrOptions),
        window.vcParallaxSkroll)
    }
    ),
    "function" != typeof window.vc_gridBehaviour && (window.vc_gridBehaviour = function() {
        jQuery.fn.vcGrid && jQuery("[data-vc-grid]").vcGrid()
    }
    ),
    "function" != typeof window.getColumnsCount && (window.getColumnsCount = function(el) {
        for (var find = !1, i = 1; !1 === find; ) {
            if (el.hasClass("columns_count_" + i))
                return find = !0,
                i;
            i++
        }
    }
    );
    var screen_size = getSizeName();
    function getSizeName() {
        var screen_w = jQuery(window).width();
        return 1170 < screen_w ? "desktop_wide" : 960 < screen_w && screen_w < 1169 ? "desktop" : 768 < screen_w && screen_w < 959 ? "tablet" : 300 < screen_w && screen_w < 767 ? "mobile" : screen_w < 300 ? "mobile_portrait" : ""
    }
    "function" != typeof window.wpb_prepare_tab_content && (window.wpb_prepare_tab_content = function(event, ui) {
        var $ui_panel, $google_maps, panel = ui.panel || ui.newPanel, $pie_charts = panel.find(".vc_pie_chart:not(.vc_ready)"), $round_charts = panel.find(".vc_round-chart"), $line_charts = panel.find(".vc_line-chart"), $carousel = panel.find('[data-ride="vc_carousel"]');
        if (vc_carouselBehaviour(),
        vc_plugin_flexslider(panel),
        ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
            var grid = jQuery(this).data("vcGrid");
            grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
        }),
        panel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && panel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
            var grid = jQuery(this).data("vcGrid");
            grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
        }),
        $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(),
        $round_charts.length && jQuery.fn.vcRoundChart && $round_charts.vcRoundChart({
            reload: !1
        }),
        $line_charts.length && jQuery.fn.vcLineChart && $line_charts.vcLineChart({
            reload: !1
        }),
        $carousel.length && jQuery.fn.carousel && $carousel.carousel("resizeAction"),
        $ui_panel = panel.find(".isotope, .wpb_image_grid_ul"),
        $google_maps = panel.find(".wpb_gmaps_widget"),
        0 < $ui_panel.length && $ui_panel.isotope("layout"),
        $google_maps.length && !$google_maps.is(".map_ready")) {
            var $frame = $google_maps.find("iframe");
            $frame.attr("src", $frame.attr("src")),
            $google_maps.addClass("map_ready")
        }
        panel.parents(".isotope").length && panel.parents(".isotope").each(function() {
            jQuery(this).isotope("layout")
        })
    }
    ),
    "function" != typeof window.vc_ttaActivation && (window.vc_ttaActivation = function() {
        jQuery("[data-vc-accordion]").on("show.vc.accordion", function(e) {
            var $ = window.jQuery
              , ui = {};
            ui.newPanel = $(this).data("vc.accordion").getTarget(),
            window.wpb_prepare_tab_content(e, ui)
        })
    }
    ),
    "function" != typeof window.vc_accordionActivate && (window.vc_accordionActivate = function(event, ui) {
        if (ui.newPanel.length && ui.newHeader.length) {
            var $pie_charts = ui.newPanel.find(".vc_pie_chart:not(.vc_ready)")
              , $round_charts = ui.newPanel.find(".vc_round-chart")
              , $line_charts = ui.newPanel.find(".vc_line-chart")
              , $carousel = ui.newPanel.find('[data-ride="vc_carousel"]');
            void 0 !== jQuery.fn.isotope && ui.newPanel.find(".isotope, .wpb_image_grid_ul").isotope("layout"),
            ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").length && ui.newPanel.find(".vc_masonry_media_grid, .vc_masonry_grid").each(function() {
                var grid = jQuery(this).data("vcGrid");
                grid && grid.gridBuilder && grid.gridBuilder.setMasonry && grid.gridBuilder.setMasonry()
            }),
            vc_carouselBehaviour(ui.newPanel),
            vc_plugin_flexslider(ui.newPanel),
            $pie_charts.length && jQuery.fn.vcChat && $pie_charts.vcChat(),
            $round_charts.length && jQuery.fn.vcRoundChart && $round_charts.vcRoundChart({
                reload: !1
            }),
            $line_charts.length && jQuery.fn.vcLineChart && $line_charts.vcLineChart({
                reload: !1
            }),
            $carousel.length && jQuery.fn.carousel && $carousel.carousel("resizeAction"),
            ui.newPanel.parents(".isotope").length && ui.newPanel.parents(".isotope").each(function() {
                jQuery(this).isotope("layout")
            })
        }
    }
    ),
    "function" != typeof window.initVideoBackgrounds && (window.initVideoBackgrounds = function() {
        return window.console && window.console.warn && window.console.warn("this function is deprecated use vc_initVideoBackgrounds"),
        vc_initVideoBackgrounds()
    }
    ),
    "function" != typeof window.vc_initVideoBackgrounds && (window.vc_initVideoBackgrounds = function() {
        jQuery("[data-vc-video-bg]").each(function() {
            var youtubeUrl, youtubeId, $element = jQuery(this);
            $element.data("vcVideoBg") ? (youtubeUrl = $element.data("vcVideoBg"),
            (youtubeId = vcExtractYoutubeId(youtubeUrl)) && ($element.find(".vc_video-bg").remove(),
            insertYoutubeVideoAsBackground($element, youtubeId)),
            jQuery(window).on("grid:items:added", function(event, $grid) {
                $element.has($grid).length && vcResizeVideoBackground($element)
            })) : $element.find(".vc_video-bg").remove()
        })
    }
    ),
    "function" != typeof window.insertYoutubeVideoAsBackground && (window.insertYoutubeVideoAsBackground = function($element, youtubeId, counter) {
        if ("undefined" == typeof YT || void 0 === YT.Player)
            return 100 < (counter = void 0 === counter ? 0 : counter) ? void console.warn("Too many attempts to load YouTube api") : void setTimeout(function() {
                insertYoutubeVideoAsBackground($element, youtubeId, counter++)
            }, 100);
        var $container = $element.prepend('<div class="vc_video-bg vc_hidden-xs"><div class="inner"></div></div>').find(".inner");
        new YT.Player($container[0],{
            width: "100%",
            height: "100%",
            videoId: youtubeId,
            playerVars: {
                playlist: youtubeId,
                iv_load_policy: 3,
                enablejsapi: 1,
                disablekb: 1,
                autoplay: 1,
                controls: 0,
                showinfo: 0,
                rel: 0,
                loop: 1,
                wmode: "transparent"
            },
            events: {
                onReady: function(event) {
                    event.target.mute().setLoop(!0)
                }
            }
        }),
        vcResizeVideoBackground($element),
        jQuery(window).bind("resize", function() {
            vcResizeVideoBackground($element)
        })
    }
    ),
    "function" != typeof window.vcResizeVideoBackground && (window.vcResizeVideoBackground = function($element) {
        var iframeW, iframeH, marginLeft, marginTop, containerW = $element.innerWidth(), containerH = $element.innerHeight();
        containerW / containerH < 16 / 9 ? (iframeW = containerH * (16 / 9),
        iframeH = containerH,
        marginLeft = -Math.round((iframeW - containerW) / 2) + "px",
        marginTop = -Math.round((iframeH - containerH) / 2) + "px") : (iframeH = (iframeW = containerW) * (9 / 16),
        marginTop = -Math.round((iframeH - containerH) / 2) + "px",
        marginLeft = -Math.round((iframeW - containerW) / 2) + "px"),
        iframeW += "px",
        iframeH += "px",
        $element.find(".vc_video-bg iframe").css({
            maxWidth: "1000%",
            marginLeft: marginLeft,
            marginTop: marginTop,
            width: iframeW,
            height: iframeH
        })
    }
    ),
    "function" != typeof window.vcExtractYoutubeId && (window.vcExtractYoutubeId = function(url) {
        if (void 0 === url)
            return !1;
        var id = url.match(/(?:https?:\/{2})?(?:w{3}\.)?youtu(?:be)?\.(?:com|be)(?:\/watch\?v=|\/)([^\s&]+)/);
        return null !== id && id[1]
    }
    ),
    "function" != typeof window.vc_googleMapsPointer && (window.vc_googleMapsPointer = function() {
        var $ = window.jQuery
          , $wpbGmapsWidget = $(".wpb_gmaps_widget");
        $wpbGmapsWidget.on("click", function() {
            $("iframe", this).css("pointer-events", "auto")
        }),
        $wpbGmapsWidget.on("mouseleave", function() {
            $("iframe", this).css("pointer-events", "none")
        }),
        $(".wpb_gmaps_widget iframe").css("pointer-events", "none")
    }
    ),
    "function" != typeof window.vc_setHoverBoxPerspective && (window.vc_setHoverBoxPerspective = function(hoverBox) {
        hoverBox.each(function() {
            var $this = jQuery(this)
              , perspective = 4 * $this.width() + "px";
            $this.css("perspective", perspective)
        })
    }
    ),
    "function" != typeof window.vc_setHoverBoxHeight && (window.vc_setHoverBoxHeight = function(hoverBox) {
        hoverBox.each(function() {
            var $this = jQuery(this)
              , hoverBoxInner = $this.find(".vc-hoverbox-inner");
            hoverBoxInner.css("min-height", 0);
            var frontHeight = $this.find(".vc-hoverbox-front-inner").outerHeight()
              , backHeight = $this.find(".vc-hoverbox-back-inner").outerHeight()
              , hoverBoxHeight = backHeight < frontHeight ? frontHeight : backHeight;
            hoverBoxHeight < 250 && (hoverBoxHeight = 250),
            hoverBoxInner.css("min-height", hoverBoxHeight + "px")
        })
    }
    ),
    "function" != typeof window.vc_prepareHoverBox && (window.vc_prepareHoverBox = function() {
        var hoverBox = jQuery(".vc-hoverbox");
        vc_setHoverBoxHeight(hoverBox),
        vc_setHoverBoxPerspective(hoverBox)
    }
    ),
    jQuery(document).ready(window.vc_prepareHoverBox),
    jQuery(window).resize(window.vc_prepareHoverBox),
    jQuery(document).ready(function($) {
        window.vc_js()
    })
}(window.jQuery);
;/*!
 * WPBakery Page Builder v6.0.0 (https://wpbakery.com)
 * Copyright 2011-2019 Michael M, WPBakery
 * License: Commercial. More details: http://go.wpbakery.com/licensing
 */

// jscs:disable
// jshint ignore: start

/*!
Waypoints - 4.0.1
Copyright © 2011-2016 Caleb Troughton
Licensed under the MIT license.
https://github.com/imakewebthings/waypoints/blob/master/licenses.txt
*/
!function() {
    "use strict";
    var e = 0
      , r = {};
    function i(t) {
        if (!t)
            throw new Error("No options passed to Waypoint constructor");
        if (!t.element)
            throw new Error("No element option passed to Waypoint constructor");
        if (!t.handler)
            throw new Error("No handler option passed to Waypoint constructor");
        this.key = "waypoint-" + e,
        this.options = i.Adapter.extend({}, i.defaults, t),
        this.element = this.options.element,
        this.adapter = new i.Adapter(this.element),
        this.callback = t.handler,
        this.axis = this.options.horizontal ? "horizontal" : "vertical",
        this.enabled = this.options.enabled,
        this.triggerPoint = null,
        this.group = i.Group.findOrCreate({
            name: this.options.group,
            axis: this.axis
        }),
        this.context = i.Context.findOrCreateByElement(this.options.context),
        i.offsetAliases[this.options.offset] && (this.options.offset = i.offsetAliases[this.options.offset]),
        this.group.add(this),
        this.context.add(this),
        r[this.key] = this,
        e += 1
    }
    i.prototype.queueTrigger = function(t) {
        this.group.queueTrigger(this, t)
    }
    ,
    i.prototype.trigger = function(t) {
        this.enabled && this.callback && this.callback.apply(this, t)
    }
    ,
    i.prototype.destroy = function() {
        this.context.remove(this),
        this.group.remove(this),
        delete r[this.key]
    }
    ,
    i.prototype.disable = function() {
        return this.enabled = !1,
        this
    }
    ,
    i.prototype.enable = function() {
        return this.context.refresh(),
        this.enabled = !0,
        this
    }
    ,
    i.prototype.next = function() {
        return this.group.next(this)
    }
    ,
    i.prototype.previous = function() {
        return this.group.previous(this)
    }
    ,
    i.invokeAll = function(t) {
        var e = [];
        for (var i in r)
            e.push(r[i]);
        for (var o = 0, n = e.length; o < n; o++)
            e[o][t]()
    }
    ,
    i.destroyAll = function() {
        i.invokeAll("destroy")
    }
    ,
    i.disableAll = function() {
        i.invokeAll("disable")
    }
    ,
    i.enableAll = function() {
        for (var t in i.Context.refreshAll(),
        r)
            r[t].enabled = !0;
        return this
    }
    ,
    i.refreshAll = function() {
        i.Context.refreshAll()
    }
    ,
    i.viewportHeight = function() {
        return window.innerHeight || document.documentElement.clientHeight
    }
    ,
    i.viewportWidth = function() {
        return document.documentElement.clientWidth
    }
    ,
    i.adapters = [],
    i.defaults = {
        context: window,
        continuous: !0,
        enabled: !0,
        group: "default",
        horizontal: !1,
        offset: 0
    },
    i.offsetAliases = {
        "bottom-in-view": function() {
            return this.context.innerHeight() - this.adapter.outerHeight()
        },
        "right-in-view": function() {
            return this.context.innerWidth() - this.adapter.outerWidth()
        }
    },
    window.VcWaypoint = i
}(),
function() {
    "use strict";
    function e(t) {
        window.setTimeout(t, 1e3 / 60)
    }
    var i = 0
      , o = {}
      , y = window.VcWaypoint
      , t = window.onload;
    function n(t) {
        this.element = t,
        this.Adapter = y.Adapter,
        this.adapter = new this.Adapter(t),
        this.key = "waypoint-context-" + i,
        this.didScroll = !1,
        this.didResize = !1,
        this.oldScroll = {
            x: this.adapter.scrollLeft(),
            y: this.adapter.scrollTop()
        },
        this.waypoints = {
            vertical: {},
            horizontal: {}
        },
        t.waypointContextKey = this.key,
        o[t.waypointContextKey] = this,
        i += 1,
        y.windowContext || (y.windowContext = !0,
        y.windowContext = new n(window)),
        this.createThrottledScrollHandler(),
        this.createThrottledResizeHandler()
    }
    n.prototype.add = function(t) {
        var e = t.options.horizontal ? "horizontal" : "vertical";
        this.waypoints[e][t.key] = t,
        this.refresh()
    }
    ,
    n.prototype.checkEmpty = function() {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal)
          , e = this.Adapter.isEmptyObject(this.waypoints.vertical)
          , i = this.element == this.element.window;
        t && e && !i && (this.adapter.off(".vcwaypoints"),
        delete o[this.key])
    }
    ,
    n.prototype.createThrottledResizeHandler = function() {
        var t = this;
        function e() {
            t.handleResize(),
            t.didResize = !1
        }
        this.adapter.on("resize.vcwaypoints", function() {
            t.didResize || (t.didResize = !0,
            y.requestAnimationFrame(e))
        })
    }
    ,
    n.prototype.createThrottledScrollHandler = function() {
        var t = this;
        function e() {
            t.handleScroll(),
            t.didScroll = !1
        }
        this.adapter.on("scroll.vcwaypoints", function() {
            t.didScroll && !y.isTouch || (t.didScroll = !0,
            y.requestAnimationFrame(e))
        })
    }
    ,
    n.prototype.handleResize = function() {
        y.Context.refreshAll()
    }
    ,
    n.prototype.handleScroll = function() {
        var t = {}
          , e = {
            horizontal: {
                newScroll: this.adapter.scrollLeft(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left"
            },
            vertical: {
                newScroll: this.adapter.scrollTop(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up"
            }
        };
        for (var i in e) {
            var o = e[i]
              , n = o.newScroll > o.oldScroll ? o.forward : o.backward;
            for (var r in this.waypoints[i]) {
                var s = this.waypoints[i][r];
                if (null !== s.triggerPoint) {
                    var a = o.oldScroll < s.triggerPoint
                      , l = o.newScroll >= s.triggerPoint;
                    (a && l || !a && !l) && (s.queueTrigger(n),
                    t[s.group.id] = s.group)
                }
            }
        }
        for (var h in t)
            t[h].flushTriggers();
        this.oldScroll = {
            x: e.horizontal.newScroll,
            y: e.vertical.newScroll
        }
    }
    ,
    n.prototype.innerHeight = function() {
        return this.element == this.element.window ? y.viewportHeight() : this.adapter.innerHeight()
    }
    ,
    n.prototype.remove = function(t) {
        delete this.waypoints[t.axis][t.key],
        this.checkEmpty()
    }
    ,
    n.prototype.innerWidth = function() {
        return this.element == this.element.window ? y.viewportWidth() : this.adapter.innerWidth()
    }
    ,
    n.prototype.destroy = function() {
        var t = [];
        for (var e in this.waypoints)
            for (var i in this.waypoints[e])
                t.push(this.waypoints[e][i]);
        for (var o = 0, n = t.length; o < n; o++)
            t[o].destroy()
    }
    ,
    n.prototype.refresh = function() {
        var t, e = this.element == this.element.window, i = e ? void 0 : this.adapter.offset(), o = {};
        for (var n in this.handleScroll(),
        t = {
            horizontal: {
                contextOffset: e ? 0 : i.left,
                contextScroll: e ? 0 : this.oldScroll.x,
                contextDimension: this.innerWidth(),
                oldScroll: this.oldScroll.x,
                forward: "right",
                backward: "left",
                offsetProp: "left"
            },
            vertical: {
                contextOffset: e ? 0 : i.top,
                contextScroll: e ? 0 : this.oldScroll.y,
                contextDimension: this.innerHeight(),
                oldScroll: this.oldScroll.y,
                forward: "down",
                backward: "up",
                offsetProp: "top"
            }
        }) {
            var r = t[n];
            for (var s in this.waypoints[n]) {
                var a, l, h, p, c = this.waypoints[n][s], u = c.options.offset, d = c.triggerPoint, f = 0, w = null == d;
                c.element !== c.element.window && (f = c.adapter.offset()[r.offsetProp]),
                "function" == typeof u ? u = u.apply(c) : "string" == typeof u && (u = parseFloat(u),
                -1 < c.options.offset.indexOf("%") && (u = Math.ceil(r.contextDimension * u / 100))),
                a = r.contextScroll - r.contextOffset,
                c.triggerPoint = Math.floor(f + a - u),
                l = d < r.oldScroll,
                h = c.triggerPoint >= r.oldScroll,
                p = !l && !h,
                !w && (l && h) ? (c.queueTrigger(r.backward),
                o[c.group.id] = c.group) : !w && p ? (c.queueTrigger(r.forward),
                o[c.group.id] = c.group) : w && r.oldScroll >= c.triggerPoint && (c.queueTrigger(r.forward),
                o[c.group.id] = c.group)
            }
        }
        return y.requestAnimationFrame(function() {
            for (var t in o)
                o[t].flushTriggers()
        }),
        this
    }
    ,
    n.findOrCreateByElement = function(t) {
        return n.findByElement(t) || new n(t)
    }
    ,
    n.refreshAll = function() {
        for (var t in o)
            o[t].refresh()
    }
    ,
    n.findByElement = function(t) {
        return o[t.waypointContextKey]
    }
    ,
    window.onload = function() {
        t && t(),
        n.refreshAll()
    }
    ,
    y.requestAnimationFrame = function(t) {
        (window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || e).call(window, t)
    }
    ,
    y.Context = n
}(),
function() {
    "use strict";
    function s(t, e) {
        return t.triggerPoint - e.triggerPoint
    }
    function a(t, e) {
        return e.triggerPoint - t.triggerPoint
    }
    var e = {
        vertical: {},
        horizontal: {}
    }
      , i = window.VcWaypoint;
    function o(t) {
        this.name = t.name,
        this.axis = t.axis,
        this.id = this.name + "-" + this.axis,
        this.waypoints = [],
        this.clearTriggerQueues(),
        e[this.axis][this.name] = this
    }
    o.prototype.add = function(t) {
        this.waypoints.push(t)
    }
    ,
    o.prototype.clearTriggerQueues = function() {
        this.triggerQueues = {
            up: [],
            down: [],
            left: [],
            right: []
        }
    }
    ,
    o.prototype.flushTriggers = function() {
        for (var t in this.triggerQueues) {
            var e = this.triggerQueues[t]
              , i = "up" === t || "left" === t;
            e.sort(i ? a : s);
            for (var o = 0, n = e.length; o < n; o += 1) {
                var r = e[o];
                (r.options.continuous || o === e.length - 1) && r.trigger([t])
            }
        }
        this.clearTriggerQueues()
    }
    ,
    o.prototype.next = function(t) {
        this.waypoints.sort(s);
        var e = i.Adapter.inArray(t, this.waypoints);
        return e === this.waypoints.length - 1 ? null : this.waypoints[e + 1]
    }
    ,
    o.prototype.previous = function(t) {
        this.waypoints.sort(s);
        var e = i.Adapter.inArray(t, this.waypoints);
        return e ? this.waypoints[e - 1] : null
    }
    ,
    o.prototype.queueTrigger = function(t, e) {
        this.triggerQueues[e].push(t)
    }
    ,
    o.prototype.remove = function(t) {
        var e = i.Adapter.inArray(t, this.waypoints);
        -1 < e && this.waypoints.splice(e, 1)
    }
    ,
    o.prototype.first = function() {
        return this.waypoints[0]
    }
    ,
    o.prototype.last = function() {
        return this.waypoints[this.waypoints.length - 1]
    }
    ,
    o.findOrCreate = function(t) {
        return e[t.axis][t.name] || new o(t)
    }
    ,
    i.Group = o
}(),
function() {
    "use strict";
    var i = window.jQuery
      , t = window.VcWaypoint;
    function o(t) {
        this.$element = i(t)
    }
    i.each(["innerHeight", "innerWidth", "off", "offset", "on", "outerHeight", "outerWidth", "scrollLeft", "scrollTop"], function(t, e) {
        o.prototype[e] = function() {
            var t = Array.prototype.slice.call(arguments);
            return this.$element[e].apply(this.$element, t)
        }
    }),
    i.each(["extend", "inArray", "isEmptyObject"], function(t, e) {
        o[e] = i[e]
    }),
    t.adapters.push({
        name: "jquery",
        Adapter: o
    }),
    t.Adapter = o
}(),
function() {
    "use strict";
    var n = window.VcWaypoint;
    function t(o) {
        return function() {
            var e = []
              , i = arguments[0];
            return o.isFunction(arguments[0]) && ((i = o.extend({}, arguments[1])).handler = arguments[0]),
            this.each(function() {
                var t = o.extend({}, i, {
                    element: this
                });
                "string" == typeof t.context && (t.context = o(this).closest(t.context)[0]),
                e.push(new n(t))
            }),
            e
        }
    }
    window.jQuery && (window.jQuery.fn.vcwaypoint = t(window.jQuery)),
    window.Zepto && (window.Zepto.fn.vcwaypoint = t(window.Zepto))
}();
;(function($) {
    var prefixes = 'Webkit Moz ms Ms O'.split(' ');
    var docElemStyle = document.documentElement.style;
    function getStyleProperty(propName) {
        if (!propName) {
            return;
        }
        if (typeof docElemStyle[propName] === 'string') {
            return propName;
        }
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);
        var prefixed;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof docElemStyle[prefixed] === 'string') {
                return prefixed;
            }
        }
    }
    var transitionProperty = getStyleProperty('transition');
    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
        transition: 'transitionend'
    }[transitionProperty];
    function getElementData(element, attributeNameCamel, attributeName, defaultValue) {
        if (element.dataset != undefined) {
            if (element.dataset[attributeNameCamel] != undefined) {
                return element.dataset[attributeNameCamel];
            } else {
                var value = $(element).data(attributeName);
                if (value == undefined) {
                    return defaultValue;
                }
                return value;
            }
            return element.dataset[attributeNameCamel] != undefined ? element.dataset[attributeNameCamel] : defaultValue;
        }
        var value = this.getAttribute(attributeName);
        return value != null && value != '' ? value : defaultValue;
    }
    function Queue(lazyInstance) {
        this.lazyInstance = lazyInstance;
        this.queue = [];
        this.running = false;
        this.initTimer();
    }
    Queue.prototype = {
        add: function(element) {
            this.queue.push(element);
        },
        next: function() {
            if (this.running || this.queue.length == 0)
                return false;
            this.running = true;
            var element = this.queue.shift();
            if (element.isOnTop()) {
                element.forceShow();
                this.finishPosition();
                return;
            }
            element.startAnimation();
        },
        finishPosition: function() {
            this.running = false;
            this.next();
        },
        initTimer: function() {
            var self = this;
            this.timer = document.createElement('div');
            this.timer.className = 'lazy-loading-timer-element';
            document.body.appendChild(this.timer);
            this.timerCallback = function() {}
            ;
            $(this.timer).bind(transitionEndEvent, function(event) {
                self.timerCallback();
            });
            this.timer.className += ' start-timer';
        },
        startTimer: function(callback) {
            setTimeout(callback, 200);
            if (this.timer.className.indexOf('start-timer') != -1) {
                this.timer.className = this.timer.className.replace(' start-timer', '');
            } else {
                this.timer.className += ' start-timer';
            }
        }
    };
    function Group(el, lazyInstance) {
        this.el = el;
        this.$el = $(el);
        this.lazyInstance = lazyInstance;
        this.elements = [];
        this.showed = false;
        this.finishedElementsCount = 0;
        this.position = {
            left: 0,
            top: 0
        };
        this.options = {
            offset: parseFloat(getElementData(el, 'llOffset', 'll-offset', 0.7)),
            itemDelay: getElementData(el, 'llItemDelay', 'll-item-delay', -1),
            isFirst: lazyInstance.hasHeaderVisuals && this.el.className.indexOf('lazy-loading-first') != -1,
            force: getElementData(el, 'llForceStart', 'll-force-start', 0) != 0,
            finishDelay: getElementData(el, 'llFinishDelay', 'll-finish-delay', 200)
        };
        this.$el.addClass('lazy-loading-before-start-animation');
    }
    timeNow = function() {
        var newDate = new Date();
        return ((newDate.getHours() < 10) ? "0" : "") + newDate.getHours() + ":" + ((newDate.getMinutes() < 10) ? "0" : "") + newDate.getMinutes() + ":" + ((newDate.getSeconds() < 10) ? "0" : "") + newDate.getSeconds();
    }
    Group.prototype = {
        addElement: function(element) {
            this.elements.push(element);
        },
        setElements: function(elements) {
            this.elements = elements;
        },
        getElements: function() {
            return this.elements;
        },
        getElementsCount: function() {
            return this.elements.length;
        },
        getItemDelay: function() {
            return this.options.itemDelay;
        },
        updatePosition: function() {
            this.position = $(this.el).offset();
        },
        getPosition: function() {
            return this.position;
        },
        isShowed: function() {
            return this.showed;
        },
        isVisible: function() {
            if (this.options.force)
                return true;
            return (this.position.top + this.options.offset * this.el.offsetHeight <= this.lazyInstance.getWindowBottom()) && (this.position.top + (1 - this.options.offset) * this.el.offsetHeight >= this.lazyInstance.getWindowTop());
        },
        isOnTop: function() {
            return false;
        },
        show: function() {
            this.lazyInstance.queue.add(this);
            this.showed = true;
        },
        forceShow: function() {
            this.showed = true;
            this.el.className = this.el.className.replace('lazy-loading-before-start-animation', 'lazy-loading-end-animation');
        },
        startAnimation: function() {
            var self = this;
            self.elements.forEach(function(element) {
                element.$el.bind(transitionEndEvent, function(event) {
                    var target = event.target || event.srcElement;
                    if (target != element.el) {
                        return;
                    }
                    element.$el.unbind(transitionEndEvent);
                    self.finishedElementsCount++;
                    if (self.finishedElementsCount >= self.getElementsCount()) {
                        setTimeout(function() {
                            var className = self.el.className.replace('lazy-loading-before-start-animation', '').replace('lazy-loading-start-animation', 'lazy-loading-end-animation');
                            self.el.className = className;
                        }, self.options.finishDelay);
                    }
                });
                element.show();
            });
            if (self.options.finishDelay > 0) {
                self.lazyInstance.queue.startTimer(function() {
                    self.finishAnimation();
                });
            } else {
                self.finishAnimation();
            }
            self.$el.addClass('lazy-loading-start-animation');
        },
        finishAnimation: function() {
            this.lazyInstance.queue.finishPosition();
        }
    };
    function Element(el, group) {
        this.el = el;
        this.$el = $(el);
        this.group = group;
        this.options = {
            effect: getElementData(el, 'llEffect', 'll-effect', ''),
            delay: getElementData(el, 'llItemDelay', 'll-item-delay', group.getItemDelay()),
            actionFunction: getElementData(el, 'llActionFunc', 'll-action-func', '')
        };
        this.options.queueType = this.options.delay != -1 ? 'async' : 'sync';
        if (this.options.effect != '') {
            this.$el.addClass('lazy-loading-item-' + this.getEffectClass());
        }
    }
    Element.prototype = {
        effects: {
            action: function(element) {
                if (!element.options.actionFunction || window[element.options.actionFunction] == null || window[element.options.actionFunction] == undefined) {
                    return;
                }
                window[element.options.actionFunction](element.el);
            }
        },
        getEffectClass: function() {
            var effectClass = this.options.effect;
            if (effectClass == 'drop-right-without-wrap' || effectClass == 'drop-right-unwrap') {
                return 'drop-right';
            }
            return effectClass;
        },
        show: function() {
            if (this.effects[this.options.effect] != undefined) {
                this.effects[this.options.effect](this);
            }
        }
    };
    LazyLoading.prototype = {
        initialize: function() {
            this.queue = new Queue(this);
            this.groups = [];
            this.hasHeaderVisuals = $('.ls-wp-container').length > 0;
            this.$checkPoint = $('#lazy-loading-point');
            if (!this.$checkPoint.length) {
                $('<div id="lazy-loading-point"></div>').insertAfter('#main');
                this.$checkPoint = $('#lazy-loading-point');
            }
            this.windowBottom = 0;
            this.windowHeight = 0;
            this.scrollHandle = false;
            this.perspectiveOpened = false;
            this.$page = $('#page');
            $(document).ready(this.documentReady.bind(this));
        },
        documentReady: function() {
            var self = this;
            this.updateCheckPointOffset();
            this.updateWindowHeight();
            this.buildGroups();
            this.windowScroll();
            $(window).resize(this.windowResize.bind(this));
            $(window).scroll(this.windowScroll.bind(this));
            $(window).on('perspective-modalview-opened', function() {
                self.perspectiveOpened = true;
            });
            $(window).on('perspective-modalview-closed', function() {
                self.perspectiveOpened = false;
            });
        },
        windowResize: function() {
            this.updateWindowHeight();
            this.updateGroups();
            this.windowScroll();
        },
        buildGroups: function() {
            var self = this;
            self.groups = [];
            $('.lazy-loading').each(function() {
                var group = new Group(this,self);
                group.updatePosition();
                $('.lazy-loading-item', this).each(function() {
                    group.addElement(new Element(this,group));
                });
                if (group.getElementsCount() > 0) {
                    self.groups.push(group);
                }
            });
        },
        updateGroups: function() {
            var self = this;
            self.groups.forEach(function(group) {
                if (group.isShowed()) {
                    return;
                }
                group.updatePosition();
            });
        },
        windowScroll: function() {
            if (this.scrollHandle) {}
            this.scrollHandle = true;
            this.calculateWindowTop();
            this.calculateWindowBottom();
            if (this.isGroupsPositionsChanged()) {
                this.updateGroups();
            }
            this.groups.forEach(function(group) {
                if (group.isShowed()) {
                    return;
                }
                if (group.isOnTop()) {
                    group.forceShow();
                }
                if (group.isVisible()) {
                    group.show();
                }
            });
            this.scrollHandle = false;
            this.queue.next();
        },
        calculateWindowBottom: function() {
            if (self.perspectiveOpened) {
                this.windowBottom = this.windowTop + this.$page.height();
            } else {
                this.windowBottom = this.windowTop + this.windowHeight;
            }
        },
        calculateWindowTop: function() {
            if (self.perspectiveOpened) {
                this.windowTop = this.$page.scrollTop();
            } else {
                this.windowTop = $(window).scrollTop();
            }
        },
        getWindowTop: function() {
            return this.windowTop;
        },
        getWindowBottom: function() {
            return this.windowBottom;
        },
        updateWindowHeight: function() {
            this.windowHeight = $(window).height();
        },
        getWindowHeight: function() {
            return this.windowHeight;
        },
        updateCheckPointOffset: function() {
            this.checkPointOffset = this.$checkPoint.length ? this.$checkPoint.offset().top : 0;
        },
        isGroupsPositionsChanged: function() {
            var oldCheckPointOffset = this.checkPointOffset;
            this.updateCheckPointOffset();
            return Math.abs(this.checkPointOffset - oldCheckPointOffset) > 1;
        },
        getLastGroup: function() {
            if (!this.groups.length) {
                return null;
            }
            return this.groups[this.groups.length - 1];
        }
    };
    function LazyLoading(options) {
        this.options = {};
        $.extend(this.options, options);
        this.initialize();
    }
    $.lazyLoading = function(options) {
        return new LazyLoading(options);
    }
    if (window.gemSettings !== undefined && !window.gemSettings.lasyDisabled && $.support.opacity) {
        $('.wpb_text_column.wpb_animate_when_almost_visible.wpb_fade').each(function() {
            $(this).wrap('<div class="lazy-loading"></div>').addClass('lazy-loading-item').data('ll-effect', 'fading');
        });
        $('.gem-list.lazy-loading').each(function() {
            $(this).data('ll-item-delay', '200');
            $('li', this).addClass('lazy-loading-item').data('ll-effect', 'slide-right');
            $('li', this).each(function(index) {
                $(this).attr("style", "transition-delay: " + (index + 1) * 0.2 + "s;");
            });
        });
        $.lazyLoading();
    }
}
)(jQuery);
;(function() {
    var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, Odometer, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, VALUE_HTML, addClass, createFromHTML, fractionalPart, now, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, truncate, wrapJQuery, _jQueryWrapped, _old, _ref, _ref1, __slice = [].slice;
    VALUE_HTML = '<span class="odometer-value"></span>';
    RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';
    DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">0</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';
    FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';
    DIGIT_FORMAT = '(,ddd).dd';
    FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;
    FRAMERATE = 30;
    DURATION = 2000;
    COUNT_FRAMERATE = 20;
    FRAMES_PER_VALUE = 2;
    DIGIT_SPEEDBOOST = .5;
    MS_PER_FRAME = 1000 / FRAMERATE;
    COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;
    TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';
    transitionCheckStyles = document.createElement('div').style;
    TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);
    requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
    createFromHTML = function(html) {
        var el;
        el = document.createElement('div');
        el.innerHTML = html;
        return el.children[0];
    }
    ;
    removeClass = function(el, name) {
        return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)",'gi'), ' ');
    }
    ;
    addClass = function(el, name) {
        removeClass(el, name);
        return el.className += " " + name;
    }
    ;
    trigger = function(el, name) {
        var evt;
        if (document.createEvent != null) {
            evt = document.createEvent('HTMLEvents');
            evt.initEvent(name, true, true);
            return el.dispatchEvent(evt);
        }
    }
    ;
    now = function() {
        var _ref, _ref1;
        return (_ref = (_ref1 = window.performance) != null ? typeof _ref1.now === "function" ? _ref1.now() : void 0 : void 0) != null ? _ref : +(new Date);
    }
    ;
    round = function(val, precision) {
        if (precision == null) {
            precision = 0;
        }
        if (!precision) {
            return Math.round(val);
        }
        val *= Math.pow(10, precision);
        val += 0.5;
        val = Math.floor(val);
        return val /= Math.pow(10, precision);
    }
    ;
    truncate = function(val) {
        if (val < 0) {
            return Math.ceil(val);
        } else {
            return Math.floor(val);
        }
    }
    ;
    fractionalPart = function(val) {
        return val - round(val);
    }
    ;
    _jQueryWrapped = false;
    (wrapJQuery = function() {
        var property, _i, _len, _ref, _results;
        if (_jQueryWrapped) {
            return;
        }
        if (window.jQuery != null) {
            _jQueryWrapped = true;
            _ref = ['html', 'text'];
            _results = [];
            for (_i = 0,
            _len = _ref.length; _i < _len; _i++) {
                property = _ref[_i];
                _results.push((function(property) {
                    var old;
                    old = window.jQuery.fn[property];
                    return window.jQuery.fn[property] = function(val) {
                        var _ref1;
                        if ((val == null) || (((_ref1 = this[0]) != null ? _ref1.odometer : void 0) == null)) {
                            return old.apply(this, arguments);
                        }
                        return this[0].odometer.update(val);
                    }
                    ;
                }
                )(property));
            }
            return _results;
        }
    }
    )();
    setTimeout(wrapJQuery, 0);
    Odometer = (function() {
        function Odometer(options) {
            var e, k, property, v, _base, _i, _len, _ref, _ref1, _ref2, _this = this;
            this.options = options;
            this.el = this.options.el;
            if (this.el.odometer != null) {
                return this.el.odometer;
            }
            this.el.odometer = this;
            _ref = Odometer.options;
            for (k in _ref) {
                v = _ref[k];
                if (this.options[k] == null) {
                    this.options[k] = v;
                }
            }
            if ((_base = this.options).duration == null) {
                _base.duration = DURATION;
            }
            this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
            this.resetFormat();
            this.value = this.cleanValue((_ref1 = this.options.value) != null ? _ref1 : '');
            this.renderInside();
            this.render();
            try {
                _ref2 = ['innerHTML', 'innerText', 'textContent'];
                for (_i = 0,
                _len = _ref2.length; _i < _len; _i++) {
                    property = _ref2[_i];
                    if (this.el[property] != null) {
                        (function(property) {
                            return Object.defineProperty(_this.el, property, {
                                get: function() {
                                    var _ref3;
                                    if (property === 'innerHTML') {
                                        return _this.inside.outerHTML;
                                    } else {
                                        return (_ref3 = _this.inside.innerText) != null ? _ref3 : _this.inside.textContent;
                                    }
                                },
                                set: function(val) {
                                    return _this.update(val);
                                }
                            });
                        }
                        )(property);
                    }
                }
            } catch (_error) {
                e = _error;
                this.watchForMutations();
            }
            this;
        }
        Odometer.prototype.renderInside = function() {
            this.inside = document.createElement('div');
            this.inside.className = 'odometer-inside';
            this.el.innerHTML = '';
            return this.el.appendChild(this.inside);
        }
        ;
        Odometer.prototype.watchForMutations = function() {
            var e, _this = this;
            if (MutationObserver == null) {
                return;
            }
            try {
                if (this.observer == null) {
                    this.observer = new MutationObserver(function(mutations) {
                        var newVal;
                        newVal = _this.el.innerText;
                        _this.renderInside();
                        _this.render(_this.value);
                        return _this.update(newVal);
                    }
                    );
                }
                this.watchMutations = true;
                return this.startWatchingMutations();
            } catch (_error) {
                e = _error;
            }
        }
        ;
        Odometer.prototype.startWatchingMutations = function() {
            if (this.watchMutations) {
                return this.observer.observe(this.el, {
                    childList: true
                });
            }
        }
        ;
        Odometer.prototype.stopWatchingMutations = function() {
            var _ref;
            return (_ref = this.observer) != null ? _ref.disconnect() : void 0;
        }
        ;
        Odometer.prototype.cleanValue = function(val) {
            var _ref;
            if (typeof val === 'string') {
                val = val.replace((_ref = this.format.radix) != null ? _ref : '.', '<radix>');
                val = val.replace(/[.,]/g, '');
                val = val.replace('<radix>', '.');
                val = parseFloat(val, 10) || 0;
            }
            return round(val, this.format.precision);
        }
        ;
        Odometer.prototype.bindTransitionEnd = function() {
            var event, renderEnqueued, _i, _len, _ref, _results, _this = this;
            if (this.transitionEndBound) {
                return;
            }
            this.transitionEndBound = true;
            renderEnqueued = false;
            _ref = TRANSITION_END_EVENTS.split(' ');
            _results = [];
            for (_i = 0,
            _len = _ref.length; _i < _len; _i++) {
                event = _ref[_i];
                _results.push(this.el.addEventListener(event, function() {
                    if (renderEnqueued) {
                        return true;
                    }
                    renderEnqueued = true;
                    setTimeout(function() {
                        _this.render();
                        renderEnqueued = false;
                        return trigger(_this.el, 'odometerdone');
                    }, 0);
                    return true;
                }, false));
            }
            return _results;
        }
        ;
        Odometer.prototype.resetFormat = function() {
            var format, fractional, parsed, precision, radix, repeating, _ref, _ref1;
            format = (_ref = this.options.format) != null ? _ref : DIGIT_FORMAT;
            format || (format = 'd');
            parsed = FORMAT_PARSER.exec(format);
            if (!parsed) {
                throw new Error("Odometer: Unparsable digit format");
            }
            _ref1 = parsed.slice(1, 4),
            repeating = _ref1[0],
            radix = _ref1[1],
            fractional = _ref1[2];
            precision = (fractional != null ? fractional.length : void 0) || 0;
            return this.format = {
                repeating: repeating,
                radix: radix,
                precision: precision
            };
        }
        ;
        Odometer.prototype.render = function(value) {
            var classes, cls, digit, match, newClasses, theme, wholePart, _i, _j, _len, _len1, _ref;
            if (value == null) {
                value = this.value;
            }
            this.stopWatchingMutations();
            this.resetFormat();
            this.inside.innerHTML = '';
            theme = this.options.theme;
            classes = this.el.className.split(' ');
            newClasses = [];
            for (_i = 0,
            _len = classes.length; _i < _len; _i++) {
                cls = classes[_i];
                if (!cls.length) {
                    continue;
                }
                if (match = /^odometer-theme-(.+)$/.exec(cls)) {
                    theme = match[1];
                    continue;
                }
                if (/^odometer(-|$)/.test(cls)) {
                    continue;
                }
                newClasses.push(cls);
            }
            newClasses.push('odometer');
            if (!TRANSITION_SUPPORT) {
                newClasses.push('odometer-no-transitions');
            }
            if (theme) {
                newClasses.push("odometer-theme-" + theme);
            } else {
                newClasses.push("odometer-auto-theme");
            }
            this.el.className = newClasses.join(' ');
            this.ribbons = {};
            this.digits = [];
            wholePart = !this.format.precision || !fractionalPart(value) || false;
            _ref = value.toString().split('').reverse();
            for (_j = 0,
            _len1 = _ref.length; _j < _len1; _j++) {
                digit = _ref[_j];
                if (digit === '.') {
                    wholePart = true;
                }
                this.addDigit(digit, wholePart);
            }
            return this.startWatchingMutations();
        }
        ;
        Odometer.prototype.update = function(newValue) {
            var diff, _this = this;
            newValue = this.cleanValue(newValue);
            if (!(diff = newValue - this.value)) {
                return;
            }
            removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
            if (diff > 0) {
                addClass(this.el, 'odometer-animating-up');
            } else {
                addClass(this.el, 'odometer-animating-down');
            }
            this.stopWatchingMutations();
            this.animate(newValue);
            this.startWatchingMutations();
            setTimeout(function() {
                _this.el.offsetHeight;
                return addClass(_this.el, 'odometer-animating');
            }, 0);
            return this.value = newValue;
        }
        ;
        Odometer.prototype.renderDigit = function() {
            return createFromHTML(DIGIT_HTML);
        }
        ;
        Odometer.prototype.insertDigit = function(digit, before) {
            if (before != null) {
                return this.inside.insertBefore(digit, before);
            } else if (!this.inside.children.length) {
                return this.inside.appendChild(digit);
            } else {
                return this.inside.insertBefore(digit, this.inside.children[0]);
            }
        }
        ;
        Odometer.prototype.addSpacer = function(chr, before, extraClasses) {
            var spacer;
            spacer = createFromHTML(FORMAT_MARK_HTML);
            spacer.innerHTML = chr;
            if (extraClasses) {
                addClass(spacer, extraClasses);
            }
            return this.insertDigit(spacer, before);
        }
        ;
        Odometer.prototype.addDigit = function(value, repeating) {
            var chr, digit, resetted, _ref;
            if (repeating == null) {
                repeating = true;
            }
            if (value === '-') {
                return this.addSpacer(value, null, 'odometer-negation-mark');
            }
            if (value === '.') {
                return this.addSpacer((_ref = this.format.radix) != null ? _ref : '.', null, 'odometer-radix-mark');
            }
            if (repeating) {
                resetted = false;
                while (true) {
                    if (!this.format.repeating.length) {
                        if (resetted) {
                            throw new Error("Bad odometer format without digits");
                        }
                        this.resetFormat();
                        resetted = true;
                    }
                    chr = this.format.repeating[this.format.repeating.length - 1];
                    this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
                    if (chr === 'd') {
                        break;
                    }
                    this.addSpacer(chr);
                }
            }
            digit = this.renderDigit();
            digit.querySelector('.odometer-value').innerHTML = value;
            this.digits.push(digit);
            return this.insertDigit(digit);
        }
        ;
        Odometer.prototype.animate = function(newValue) {
            if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
                return this.animateCount(newValue);
            } else {
                return this.animateSlide(newValue);
            }
        }
        ;
        Odometer.prototype.animateCount = function(newValue) {
            var cur, diff, last, start, tick, _this = this;
            if (!(diff = +newValue - this.value)) {
                return;
            }
            start = last = now();
            cur = this.value;
            return (tick = function() {
                var delta, dist, fraction;
                if ((now() - start) > _this.options.duration) {
                    _this.value = newValue;
                    _this.render();
                    trigger(_this.el, 'odometerdone');
                    return;
                }
                delta = now() - last;
                if (delta > COUNT_MS_PER_FRAME) {
                    last = now();
                    fraction = delta / _this.options.duration;
                    dist = diff * fraction;
                    cur += dist;
                    _this.render(Math.round(cur));
                }
                if (requestAnimationFrame != null) {
                    return requestAnimationFrame(tick);
                } else {
                    return setTimeout(tick, COUNT_MS_PER_FRAME);
                }
            }
            )();
        }
        ;
        Odometer.prototype.getDigitCount = function() {
            var i, max, value, values, _i, _len;
            values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            for (i = _i = 0,
            _len = values.length; _i < _len; i = ++_i) {
                value = values[i];
                values[i] = Math.abs(value);
            }
            max = Math.max.apply(Math, values);
            return Math.ceil(Math.log(max + 1) / Math.log(10));
        }
        ;
        Odometer.prototype.getFractionalDigitCount = function() {
            var i, parser, parts, value, values, _i, _len;
            values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            parser = /^\-?\d*\.(\d*?)0*$/;
            for (i = _i = 0,
            _len = values.length; _i < _len; i = ++_i) {
                value = values[i];
                values[i] = value.toString();
                parts = parser.exec(values[i]);
                if (parts == null) {
                    values[i] = 0;
                } else {
                    values[i] = parts[1].length;
                }
            }
            return Math.max.apply(Math, values);
        }
        ;
        Odometer.prototype.resetDigits = function() {
            this.digits = [];
            this.ribbons = [];
            this.inside.innerHTML = '';
            return this.resetFormat();
        }
        ;
        Odometer.prototype.animateSlide = function(newValue) {
            var boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, mark, numEl, oldValue, start, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _results;
            oldValue = this.value;
            fractionalCount = this.getFractionalDigitCount(oldValue, newValue);
            if (fractionalCount) {
                newValue = newValue * Math.pow(10, fractionalCount);
                oldValue = oldValue * Math.pow(10, fractionalCount);
            }
            if (!(diff = newValue - oldValue)) {
                return;
            }
            this.bindTransitionEnd();
            digitCount = this.getDigitCount(oldValue, newValue);
            digits = [];
            boosted = 0;
            for (i = _i = 0; 0 <= digitCount ? _i < digitCount : _i > digitCount; i = 0 <= digitCount ? ++_i : --_i) {
                start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
                end = truncate(newValue / Math.pow(10, digitCount - i - 1));
                dist = end - start;
                if (Math.abs(dist) > this.MAX_VALUES) {
                    frames = [];
                    incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
                    cur = start;
                    while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
                        frames.push(Math.round(cur));
                        cur += incr;
                    }
                    if (frames[frames.length - 1] !== end) {
                        frames.push(end);
                    }
                    boosted++;
                } else {
                    frames = (function() {
                        _results = [];
                        for (var _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--) {
                            _results.push(_j);
                        }
                        return _results;
                    }
                    ).apply(this);
                }
                for (i = _k = 0,
                _len = frames.length; _k < _len; i = ++_k) {
                    frame = frames[i];
                    frames[i] = Math.abs(frame % 10);
                }
                digits.push(frames);
            }
            this.resetDigits();
            _ref = digits.reverse();
            for (i = _l = 0,
            _len1 = _ref.length; _l < _len1; i = ++_l) {
                frames = _ref[i];
                if (!this.digits[i]) {
                    this.addDigit(' ', i >= fractionalCount);
                }
                if ((_base = this.ribbons)[i] == null) {
                    _base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
                }
                this.ribbons[i].innerHTML = '';
                if (diff < 0) {
                    frames = frames.reverse();
                }
                for (j = _m = 0,
                _len2 = frames.length; _m < _len2; j = ++_m) {
                    frame = frames[j];
                    numEl = document.createElement('div');
                    numEl.className = 'odometer-value';
                    numEl.innerHTML = frame;
                    this.ribbons[i].appendChild(numEl);
                    if (j === frames.length - 1) {
                        addClass(numEl, 'odometer-last-value');
                    }
                    if (j === 0) {
                        addClass(numEl, 'odometer-first-value');
                    }
                }
            }
            if (start < 0) {
                this.addDigit('-');
            }
            mark = this.inside.querySelector('.odometer-radix-mark');
            if (mark != null) {
                mark.parent.removeChild(mark);
            }
            if (fractionalCount) {
                return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
            }
        }
        ;
        return Odometer;
    }
    )();
    Odometer.options = (_ref = window.odometerOptions) != null ? _ref : {};
    setTimeout(function() {
        var k, v, _base, _ref1, _results;
        if (window.odometerOptions) {
            _ref1 = window.odometerOptions;
            _results = [];
            for (k in _ref1) {
                v = _ref1[k];
                _results.push((_base = Odometer.options)[k] != null ? (_base = Odometer.options)[k] : _base[k] = v);
            }
            return _results;
        }
    }, 0);
    Odometer.init = function() {
        var el, elements, _i, _len, _ref1, _results;
        if (document.querySelectorAll == null) {
            return;
        }
        elements = document.querySelectorAll(Odometer.options.selector || '.odometer');
        _results = [];
        for (_i = 0,
        _len = elements.length; _i < _len; _i++) {
            el = elements[_i];
            _results.push(el.odometer = new Odometer({
                el: el,
                value: (_ref1 = el.innerText) != null ? _ref1 : el.textContent
            }));
        }
        return _results;
    }
    ;
    if ((((_ref1 = document.documentElement) != null ? _ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
        _old = document.onreadystatechange;
        document.onreadystatechange = function() {
            if (document.readyState === 'complete' && Odometer.options.auto !== false) {
                Odometer.init();
            }
            return _old != null ? _old.apply(this, arguments) : void 0;
        }
        ;
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            if (Odometer.options.auto !== false) {
                return Odometer.init();
            }
        }, false);
    }
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], function() {
            return Odometer;
        });
    } else if (typeof exports === !'undefined') {
        module.exports = Odometer;
    } else {
        window.Odometer = Odometer;
    }
}
).call(this);
;(function($) {
    $(function() {
        $('.gem-counter').each(function() {
            var $item = $(this);
            var initHover = {
                icon_color1: $('.gem-icon-half-1', $item).css('color'),
                icon_color2: $('.gem-icon-half-2', $item).css('color'),
                icon_background: $('.gem-icon-inner', $item).css('background-color'),
                icon_border: $('.gem-icon', $item).css('border-left-color'),
                icon_box_border: $('.gem-counter-icon-circle-1', $item).css('border-left-color'),
                icon_box_shadow: $('.gem-icon', $item).css('box-shadow'),
                box_color: $('.gem-counter-inner', $item).css('background-color'),
                number_color: $('.gem-counter-number', $item).css('color'),
                text_color: $('.gem-counter-text', $item).css('color'),
            };
            $item.data('initHover', initHover);
            if ($item.hasClass('gem-counter-effect-background-reverse') || $item.hasClass('gem-counter-effect-border-reverse')) {
                $('.gem-icon-inner', $item).prepend('<div class="gem-counter-animation"/>');
                if ($item.hasClass('gem-counter-effect-border-reverse')) {
                    $('.gem-counter-animation', $item).css('background-color', initHover.box_color);
                } else if ($item.data('hover-background-color')) {
                    $('.gem-counter-animation', $item).css('background-color', $item.data('hover-background-color'));
                }
            }
        });
        $('body').on('mouseenter', '.gem-counter a', function() {
            var $item = $(this).closest('.gem-counter');
            var initHover = $item.data('initHover');
            var $box = $item.closest('.gem-counter-box');
            $item.addClass('hover');
            if ($item.data('hover-icon-color')) {
                if ($box.hasClass('gem-counter-style-2')) {
                    $('.gem-icon-half-1', $item).css('color', initHover.icon_box_border);
                    $('.gem-icon-half-2', $item).css('color', initHover.icon_box_border);
                    $('.gem-counter-icon-circle-1', $item).css('border-color', $item.data('hover-icon-color'));
                    $('.gem-counter-icon-circle-1', $item).css('background-color', $item.data('hover-icon-color'));
                    $('.gem-counter-icon-circle-2', $item).css('border-color', 'transparent');
                } else {
                    if ($item.hasClass('gem-counter-effect-background-reverse')) {
                        $('.gem-icon', $item).css('border-color', $item.data('hover-icon-color'));
                        $('.gem-icon-half-1', $item).css('color', $item.data('hover-icon-color'));
                        $('.gem-icon-half-2', $item).css('color', $item.data('hover-icon-color'));
                    }
                    if ($item.hasClass('gem-counter-effect-border-reverse')) {
                        $('.gem-icon', $item).css('border-color', $item.data('hover-icon-color'));
                        $('.gem-icon-inner', $item).css('background-color', $item.data('hover-icon-color'));
                        $('.gem-icon-half-1', $item).css('color', '#ffffff');
                        $('.gem-icon-half-2', $item).css('color', '#ffffff');
                    }
                    if ($item.hasClass('gem-counter-effect-simple')) {
                        $('.gem-icon-half-1', $item).css('color', $item.data('hover-icon-color'));
                        $('.gem-icon-half-2', $item).css('color', $item.data('hover-icon-color'));
                    }
                }
            }
            if ($item.data('hover-numbers-color')) {
                $('.gem-counter-number', $item).css('color', $item.data('hover-numbers-color'));
            }
            if ($item.data('hover-text-color')) {
                $('.gem-counter-text', $item).css('color', $item.data('hover-text-color'));
            }
            if ($item.data('hover-background-color')) {
                $('.gem-counter-inner', $item).css('background-color', $item.data('hover-background-color'));
                $('.gem-counter-bottom-left, .gem-counter-bottom-right', $item).css('background-color', $item.data('hover-background-color'));
                $('.gem-counter-bottom svg', $item).css('fill', $item.data('hover-background-color'));
                if (!$box.hasClass('gem-counter-style-vertical')) {
                    $('.gem-icon', $item).css('box-shadow', '0 0 0 5px ' + $item.data('hover-background-color') + ', 0 0 0 6px ' + ($item.data('hover-icon-color') ? $item.data('hover-icon-color') : '#ffffff'));
                }
            }
        });
        $('body').on('mouseleave', '.gem-counter a', function() {
            var $item = $(this).closest('.gem-counter');
            var initHover = $item.data('initHover');
            $item.removeClass('hover');
            $('.gem-icon', $item).css('border-color', initHover.icon_border);
            $('.gem-icon-inner', $item).css('background-color', initHover.icon_background);
            $('.gem-icon-half-1', $item).css('color', initHover.icon_color1);
            $('.gem-icon-half-2', $item).css('color', initHover.icon_color2);
            $('.gem-icon', $item).css('box-shadow', initHover.icon_box_shadow),
            $('.gem-counter-icon-circle-1, .gem-counter-icon-circle-2', $item).css('border-color', initHover.icon_box_border);
            $('.gem-counter-icon-circle-1').css('background-color', 'transparent');
            $('.gem-counter-inner', $item).css('background-color', initHover.box_color);
            $('.gem-counter-bottom-left, .gem-counter-bottom-right', $item).css('background-color', initHover.box_color);
            $('.gem-counter-bottom svg', $item).css('fill', initHover.box_color);
            $('.gem-counter-number', $item).css('color', initHover.number_color);
            $('.gem-counter-text', $item).css('color', initHover.text_color);
        });
    });
}
)(jQuery);
;(function($) {
    function init_odometer(el) {
        if ($('.gem-counter-odometer', el).size() == 0)
            return;
        var odometer = $('.gem-counter-odometer', el).get(0);
        var format = $(el).closest('.gem-counter-box').data('number-format');
        format = format ? format : '(ddd).ddd';
        var od = new Odometer({
            el: odometer,
            value: $(odometer).text(),
            format: format
        });
        od.update($(odometer).data('to'));
    }
    window.thegem_init_odometer = init_odometer;
    $('.gem-counter').each(function(index) {
        if ($(this).closest('.gem-counter-box').size() > 0 && $(this).closest('.gem-counter-box').hasClass('lazy-loading') && !window.gemSettings.lasyDisabled) {
            $(this).addClass('lazy-loading-item').data('ll-effect', 'action').data('item-delay', '0').data('ll-action-func', 'thegem_init_odometer');
            $('.gem-icon', this).addClass('lazy-loading-item').data('ll-effect', 'fading').data('item-delay', '0');
            $('.gem-counter-text', this).addClass('lazy-loading-item').data('ll-effect', 'fading').data('item-delay', '0');
            return;
        }
        init_odometer(this);
    });
}
)(jQuery);
;(function(a) {
    if (typeof define === "function" && define.amd && define.amd.jQuery) {
        define(["jquery"], a)
    } else {
        if (typeof module !== "undefined" && module.exports) {
            a(require("jquery"))
        } else {
            a(jQuery)
        }
    }
}(function(f) {
    var y = "1.6.15"
      , p = "left"
      , o = "right"
      , e = "up"
      , x = "down"
      , c = "in"
      , A = "out"
      , m = "none"
      , s = "auto"
      , l = "swipe"
      , t = "pinch"
      , B = "tap"
      , j = "doubletap"
      , b = "longtap"
      , z = "hold"
      , E = "horizontal"
      , u = "vertical"
      , i = "all"
      , r = 10
      , g = "start"
      , k = "move"
      , h = "end"
      , q = "cancel"
      , a = "ontouchstart"in window
      , v = window.navigator.msPointerEnabled && !window.navigator.pointerEnabled && !a
      , d = (window.navigator.pointerEnabled || window.navigator.msPointerEnabled) && !a
      , C = "TouchSwipe";
    var n = {
        fingers: 1,
        threshold: 75,
        cancelThreshold: null,
        pinchThreshold: 20,
        maxTimeThreshold: null,
        fingerReleaseThreshold: 250,
        longTapThreshold: 500,
        doubleTapThreshold: 200,
        swipe: null,
        swipeLeft: null,
        swipeRight: null,
        swipeUp: null,
        swipeDown: null,
        swipeStatus: null,
        pinchIn: null,
        pinchOut: null,
        pinchStatus: null,
        click: null,
        tap: null,
        doubleTap: null,
        longTap: null,
        hold: null,
        triggerOnTouchEnd: true,
        triggerOnTouchLeave: false,
        allowPageScroll: "auto",
        fallbackToMouseEvents: true,
        excludedElements: "label, button, input, select, textarea, .noSwipe",
        preventDefaultEvents: true
    };
    f.fn.swipe = function(H) {
        var G = f(this)
          , F = G.data(C);
        if (F && typeof H === "string") {
            if (F[H]) {
                return F[H].apply(this, Array.prototype.slice.call(arguments, 1))
            } else {
                f.error("Method " + H + " does not exist on jQuery.swipe")
            }
        } else {
            if (F && typeof H === "object") {
                F.option.apply(this, arguments)
            } else {
                if (!F && (typeof H === "object" || !H)) {
                    return w.apply(this, arguments)
                }
            }
        }
        return G
    }
    ;
    f.fn.swipe.version = y;
    f.fn.swipe.defaults = n;
    f.fn.swipe.phases = {
        PHASE_START: g,
        PHASE_MOVE: k,
        PHASE_END: h,
        PHASE_CANCEL: q
    };
    f.fn.swipe.directions = {
        LEFT: p,
        RIGHT: o,
        UP: e,
        DOWN: x,
        IN: c,
        OUT: A
    };
    f.fn.swipe.pageScroll = {
        NONE: m,
        HORIZONTAL: E,
        VERTICAL: u,
        AUTO: s
    };
    f.fn.swipe.fingers = {
        ONE: 1,
        TWO: 2,
        THREE: 3,
        FOUR: 4,
        FIVE: 5,
        ALL: i
    };
    function w(F) {
        if (F && (F.allowPageScroll === undefined && (F.swipe !== undefined || F.swipeStatus !== undefined))) {
            F.allowPageScroll = m
        }
        if (F.click !== undefined && F.tap === undefined) {
            F.tap = F.click
        }
        if (!F) {
            F = {}
        }
        F = f.extend({}, f.fn.swipe.defaults, F);
        return this.each(function() {
            var H = f(this);
            var G = H.data(C);
            if (!G) {
                G = new D(this,F);
                H.data(C, G)
            }
        })
    }
    function D(a5, au) {
        var au = f.extend({}, au);
        var az = (a || d || !au.fallbackToMouseEvents)
          , K = az ? (d ? (v ? "MSPointerDown" : "pointerdown") : "touchstart") : "mousedown"
          , ax = az ? (d ? (v ? "MSPointerMove" : "pointermove") : "touchmove") : "mousemove"
          , V = az ? (d ? (v ? "MSPointerUp" : "pointerup") : "touchend") : "mouseup"
          , T = az ? (d ? "mouseleave" : null) : "mouseleave"
          , aD = (d ? (v ? "MSPointerCancel" : "pointercancel") : "touchcancel");
        var ag = 0
          , aP = null
          , a2 = null
          , ac = 0
          , a1 = 0
          , aZ = 0
          , H = 1
          , ap = 0
          , aJ = 0
          , N = null;
        var aR = f(a5);
        var aa = "start";
        var X = 0;
        var aQ = {};
        var U = 0
          , a3 = 0
          , a6 = 0
          , ay = 0
          , O = 0;
        var aW = null
          , af = null;
        try {
            aR.bind(K, aN);
            aR.bind(aD, ba)
        } catch (aj) {
            f.error("events not supported " + K + "," + aD + " on jQuery.swipe")
        }
        this.enable = function() {
            aR.bind(K, aN);
            aR.bind(aD, ba);
            return aR
        }
        ;
        this.disable = function() {
            aK();
            return aR
        }
        ;
        this.destroy = function() {
            aK();
            aR.data(C, null);
            aR = null
        }
        ;
        this.option = function(bd, bc) {
            if (typeof bd === "object") {
                au = f.extend(au, bd)
            } else {
                if (au[bd] !== undefined) {
                    if (bc === undefined) {
                        return au[bd]
                    } else {
                        au[bd] = bc
                    }
                } else {
                    if (!bd) {
                        return au
                    } else {
                        f.error("Option " + bd + " does not exist on jQuery.swipe.options")
                    }
                }
            }
            return null
        }
        ;
        function aN(be) {
            if (aB()) {
                return
            }
            if (f(be.target).closest(au.excludedElements, aR).length > 0) {
                return
            }
            var bf = be.originalEvent ? be.originalEvent : be;
            var bd, bg = bf.touches, bc = bg ? bg[0] : bf;
            aa = g;
            if (bg) {
                X = bg.length
            } else {
                if (au.preventDefaultEvents !== false) {
                    be.preventDefault()
                }
            }
            ag = 0;
            aP = null;
            a2 = null;
            aJ = null;
            ac = 0;
            a1 = 0;
            aZ = 0;
            H = 1;
            ap = 0;
            N = ab();
            S();
            ai(0, bc);
            if (!bg || (X === au.fingers || au.fingers === i) || aX()) {
                U = ar();
                if (X == 2) {
                    ai(1, bg[1]);
                    a1 = aZ = at(aQ[0].start, aQ[1].start)
                }
                if (au.swipeStatus || au.pinchStatus) {
                    bd = P(bf, aa)
                }
            } else {
                bd = false
            }
            if (bd === false) {
                aa = q;
                P(bf, aa);
                return bd
            } else {
                if (au.hold) {
                    af = setTimeout(f.proxy(function() {
                        aR.trigger("hold", [bf.target]);
                        if (au.hold) {
                            bd = au.hold.call(aR, bf, bf.target)
                        }
                    }, this), au.longTapThreshold)
                }
                an(true)
            }
            return null
        }
        function a4(bf) {
            var bi = bf.originalEvent ? bf.originalEvent : bf;
            if (aa === h || aa === q || al()) {
                return
            }
            var be, bj = bi.touches, bd = bj ? bj[0] : bi;
            var bg = aH(bd);
            a3 = ar();
            if (bj) {
                X = bj.length
            }
            if (au.hold) {
                clearTimeout(af)
            }
            aa = k;
            if (X == 2) {
                if (a1 == 0) {
                    ai(1, bj[1]);
                    a1 = aZ = at(aQ[0].start, aQ[1].start)
                } else {
                    aH(bj[1]);
                    aZ = at(aQ[0].end, aQ[1].end);
                    aJ = aq(aQ[0].end, aQ[1].end)
                }
                H = a8(a1, aZ);
                ap = Math.abs(a1 - aZ)
            }
            if ((X === au.fingers || au.fingers === i) || !bj || aX()) {
                aP = aL(bg.start, bg.end);
                a2 = aL(bg.last, bg.end);
                ak(bf, a2);
                ag = aS(bg.start, bg.end);
                ac = aM();
                aI(aP, ag);
                be = P(bi, aa);
                if (!au.triggerOnTouchEnd || au.triggerOnTouchLeave) {
                    var bc = true;
                    if (au.triggerOnTouchLeave) {
                        var bh = aY(this);
                        bc = F(bg.end, bh)
                    }
                    if (!au.triggerOnTouchEnd && bc) {
                        aa = aC(k)
                    } else {
                        if (au.triggerOnTouchLeave && !bc) {
                            aa = aC(h)
                        }
                    }
                    if (aa == q || aa == h) {
                        P(bi, aa)
                    }
                }
            } else {
                aa = q;
                P(bi, aa)
            }
            if (be === false) {
                aa = q;
                P(bi, aa)
            }
        }
        function M(bc) {
            var bd = bc.originalEvent ? bc.originalEvent : bc
              , be = bd.touches;
            if (be) {
                if (be.length && !al()) {
                    G(bd);
                    return true
                } else {
                    if (be.length && al()) {
                        return true
                    }
                }
            }
            if (al()) {
                X = ay
            }
            a3 = ar();
            ac = aM();
            if (bb() || !am()) {
                aa = q;
                P(bd, aa)
            } else {
                if (au.triggerOnTouchEnd || (au.triggerOnTouchEnd == false && aa === k)) {
                    if (au.preventDefaultEvents !== false) {
                        bc.preventDefault()
                    }
                    aa = h;
                    P(bd, aa)
                } else {
                    if (!au.triggerOnTouchEnd && a7()) {
                        aa = h;
                        aF(bd, aa, B)
                    } else {
                        if (aa === k) {
                            aa = q;
                            P(bd, aa)
                        }
                    }
                }
            }
            an(false);
            return null
        }
        function ba() {
            X = 0;
            a3 = 0;
            U = 0;
            a1 = 0;
            aZ = 0;
            H = 1;
            S();
            an(false)
        }
        function L(bc) {
            var bd = bc.originalEvent ? bc.originalEvent : bc;
            if (au.triggerOnTouchLeave) {
                aa = aC(h);
                P(bd, aa)
            }
        }
        function aK() {
            aR.unbind(K, aN);
            aR.unbind(aD, ba);
            aR.unbind(ax, a4);
            aR.unbind(V, M);
            if (T) {
                aR.unbind(T, L)
            }
            an(false)
        }
        function aC(bg) {
            var bf = bg;
            var be = aA();
            var bd = am();
            var bc = bb();
            if (!be || bc) {
                bf = q
            } else {
                if (bd && bg == k && (!au.triggerOnTouchEnd || au.triggerOnTouchLeave)) {
                    bf = h
                } else {
                    if (!bd && bg == h && au.triggerOnTouchLeave) {
                        bf = q
                    }
                }
            }
            return bf
        }
        function P(be, bc) {
            var bd, bf = be.touches;
            if (J() || W()) {
                bd = aF(be, bc, l)
            }
            if ((Q() || aX()) && bd !== false) {
                bd = aF(be, bc, t)
            }
            if (aG() && bd !== false) {
                bd = aF(be, bc, j)
            } else {
                if (ao() && bd !== false) {
                    bd = aF(be, bc, b)
                } else {
                    if (ah() && bd !== false) {
                        bd = aF(be, bc, B)
                    }
                }
            }
            if (bc === q) {
                if (W()) {
                    bd = aF(be, bc, l)
                }
                if (aX()) {
                    bd = aF(be, bc, t)
                }
                ba(be)
            }
            if (bc === h) {
                if (bf) {
                    if (!bf.length) {
                        ba(be)
                    }
                } else {
                    ba(be)
                }
            }
            return bd
        }
        function aF(bf, bc, be) {
            var bd;
            if (be == l) {
                aR.trigger("swipeStatus", [bc, aP || null, ag || 0, ac || 0, X, aQ, a2]);
                if (au.swipeStatus) {
                    bd = au.swipeStatus.call(aR, bf, bc, aP || null, ag || 0, ac || 0, X, aQ, a2);
                    if (bd === false) {
                        return false
                    }
                }
                if (bc == h && aV()) {
                    clearTimeout(aW);
                    clearTimeout(af);
                    aR.trigger("swipe", [aP, ag, ac, X, aQ, a2]);
                    if (au.swipe) {
                        bd = au.swipe.call(aR, bf, aP, ag, ac, X, aQ, a2);
                        if (bd === false) {
                            return false
                        }
                    }
                    switch (aP) {
                    case p:
                        aR.trigger("swipeLeft", [aP, ag, ac, X, aQ, a2]);
                        if (au.swipeLeft) {
                            bd = au.swipeLeft.call(aR, bf, aP, ag, ac, X, aQ, a2)
                        }
                        break;
                    case o:
                        aR.trigger("swipeRight", [aP, ag, ac, X, aQ, a2]);
                        if (au.swipeRight) {
                            bd = au.swipeRight.call(aR, bf, aP, ag, ac, X, aQ, a2)
                        }
                        break;
                    case e:
                        aR.trigger("swipeUp", [aP, ag, ac, X, aQ, a2]);
                        if (au.swipeUp) {
                            bd = au.swipeUp.call(aR, bf, aP, ag, ac, X, aQ, a2)
                        }
                        break;
                    case x:
                        aR.trigger("swipeDown", [aP, ag, ac, X, aQ, a2]);
                        if (au.swipeDown) {
                            bd = au.swipeDown.call(aR, bf, aP, ag, ac, X, aQ, a2)
                        }
                        break
                    }
                }
            }
            if (be == t) {
                aR.trigger("pinchStatus", [bc, aJ || null, ap || 0, ac || 0, X, H, aQ]);
                if (au.pinchStatus) {
                    bd = au.pinchStatus.call(aR, bf, bc, aJ || null, ap || 0, ac || 0, X, H, aQ);
                    if (bd === false) {
                        return false
                    }
                }
                if (bc == h && a9()) {
                    switch (aJ) {
                    case c:
                        aR.trigger("pinchIn", [aJ || null, ap || 0, ac || 0, X, H, aQ]);
                        if (au.pinchIn) {
                            bd = au.pinchIn.call(aR, bf, aJ || null, ap || 0, ac || 0, X, H, aQ)
                        }
                        break;
                    case A:
                        aR.trigger("pinchOut", [aJ || null, ap || 0, ac || 0, X, H, aQ]);
                        if (au.pinchOut) {
                            bd = au.pinchOut.call(aR, bf, aJ || null, ap || 0, ac || 0, X, H, aQ)
                        }
                        break
                    }
                }
            }
            if (be == B) {
                if (bc === q || bc === h) {
                    clearTimeout(aW);
                    clearTimeout(af);
                    if (Z() && !I()) {
                        O = ar();
                        aW = setTimeout(f.proxy(function() {
                            O = null;
                            aR.trigger("tap", [bf.target]);
                            if (au.tap) {
                                bd = au.tap.call(aR, bf, bf.target)
                            }
                        }, this), au.doubleTapThreshold)
                    } else {
                        O = null;
                        aR.trigger("tap", [bf.target]);
                        if (au.tap) {
                            bd = au.tap.call(aR, bf, bf.target)
                        }
                    }
                }
            } else {
                if (be == j) {
                    if (bc === q || bc === h) {
                        clearTimeout(aW);
                        clearTimeout(af);
                        O = null;
                        aR.trigger("doubletap", [bf.target]);
                        if (au.doubleTap) {
                            bd = au.doubleTap.call(aR, bf, bf.target)
                        }
                    }
                } else {
                    if (be == b) {
                        if (bc === q || bc === h) {
                            clearTimeout(aW);
                            O = null;
                            aR.trigger("longtap", [bf.target]);
                            if (au.longTap) {
                                bd = au.longTap.call(aR, bf, bf.target)
                            }
                        }
                    }
                }
            }
            return bd
        }
        function am() {
            var bc = true;
            if (au.threshold !== null) {
                bc = ag >= au.threshold
            }
            return bc
        }
        function bb() {
            var bc = false;
            if (au.cancelThreshold !== null && aP !== null) {
                bc = (aT(aP) - ag) >= au.cancelThreshold
            }
            return bc
        }
        function ae() {
            if (au.pinchThreshold !== null) {
                return ap >= au.pinchThreshold
            }
            return true
        }
        function aA() {
            var bc;
            if (au.maxTimeThreshold) {
                if (ac >= au.maxTimeThreshold) {
                    bc = false
                } else {
                    bc = true
                }
            } else {
                bc = true
            }
            return bc
        }
        function ak(bc, bd) {
            if (au.preventDefaultEvents === false) {
                return
            }
            if (au.allowPageScroll === m) {
                bc.preventDefault()
            } else {
                var be = au.allowPageScroll === s;
                switch (bd) {
                case p:
                    if ((au.swipeLeft && be) || (!be && au.allowPageScroll != E)) {
                        bc.preventDefault()
                    }
                    break;
                case o:
                    if ((au.swipeRight && be) || (!be && au.allowPageScroll != E)) {
                        bc.preventDefault()
                    }
                    break;
                case e:
                    if ((au.swipeUp && be) || (!be && au.allowPageScroll != u)) {
                        bc.preventDefault()
                    }
                    break;
                case x:
                    if ((au.swipeDown && be) || (!be && au.allowPageScroll != u)) {
                        bc.preventDefault()
                    }
                    break
                }
            }
        }
        function a9() {
            var bd = aO();
            var bc = Y();
            var be = ae();
            return bd && bc && be
        }
        function aX() {
            return !!(au.pinchStatus || au.pinchIn || au.pinchOut)
        }
        function Q() {
            return !!(a9() && aX())
        }
        function aV() {
            var bf = aA();
            var bh = am();
            var be = aO();
            var bc = Y();
            var bd = bb();
            var bg = !bd && bc && be && bh && bf;
            return bg
        }
        function W() {
            return !!(au.swipe || au.swipeStatus || au.swipeLeft || au.swipeRight || au.swipeUp || au.swipeDown)
        }
        function J() {
            return !!(aV() && W())
        }
        function aO() {
            return ((X === au.fingers || au.fingers === i) || !a)
        }
        function Y() {
            return aQ[0].end.x !== 0
        }
        function a7() {
            return !!(au.tap)
        }
        function Z() {
            return !!(au.doubleTap)
        }
        function aU() {
            return !!(au.longTap)
        }
        function R() {
            if (O == null) {
                return false
            }
            var bc = ar();
            return (Z() && ((bc - O) <= au.doubleTapThreshold))
        }
        function I() {
            return R()
        }
        function aw() {
            return ((X === 1 || !a) && (isNaN(ag) || ag < au.threshold))
        }
        function a0() {
            return ((ac > au.longTapThreshold) && (ag < r))
        }
        function ah() {
            return !!(aw() && a7())
        }
        function aG() {
            return !!(R() && Z())
        }
        function ao() {
            return !!(a0() && aU())
        }
        function G(bc) {
            a6 = ar();
            ay = bc.touches.length + 1
        }
        function S() {
            a6 = 0;
            ay = 0
        }
        function al() {
            var bc = false;
            if (a6) {
                var bd = ar() - a6;
                if (bd <= au.fingerReleaseThreshold) {
                    bc = true
                }
            }
            return bc
        }
        function aB() {
            return !!(aR.data(C + "_intouch") === true)
        }
        function an(bc) {
            if (!aR) {
                return
            }
            if (bc === true) {
                aR.bind(ax, a4);
                aR.bind(V, M);
                if (T) {
                    aR.bind(T, L)
                }
            } else {
                aR.unbind(ax, a4, false);
                aR.unbind(V, M, false);
                if (T) {
                    aR.unbind(T, L, false)
                }
            }
            aR.data(C + "_intouch", bc === true)
        }
        function ai(be, bc) {
            var bd = {
                start: {
                    x: 0,
                    y: 0
                },
                last: {
                    x: 0,
                    y: 0
                },
                end: {
                    x: 0,
                    y: 0
                }
            };
            bd.start.x = bd.last.x = bd.end.x = bc.pageX || bc.clientX;
            bd.start.y = bd.last.y = bd.end.y = bc.pageY || bc.clientY;
            aQ[be] = bd;
            return bd
        }
        function aH(bc) {
            var be = bc.identifier !== undefined ? bc.identifier : 0;
            var bd = ad(be);
            if (bd === null) {
                bd = ai(be, bc)
            }
            bd.last.x = bd.end.x;
            bd.last.y = bd.end.y;
            bd.end.x = bc.pageX || bc.clientX;
            bd.end.y = bc.pageY || bc.clientY;
            return bd
        }
        function ad(bc) {
            return aQ[bc] || null
        }
        function aI(bc, bd) {
            bd = Math.max(bd, aT(bc));
            N[bc].distance = bd
        }
        function aT(bc) {
            if (N[bc]) {
                return N[bc].distance
            }
            return undefined
        }
        function ab() {
            var bc = {};
            bc[p] = av(p);
            bc[o] = av(o);
            bc[e] = av(e);
            bc[x] = av(x);
            return bc
        }
        function av(bc) {
            return {
                direction: bc,
                distance: 0
            }
        }
        function aM() {
            return a3 - U
        }
        function at(bf, be) {
            var bd = Math.abs(bf.x - be.x);
            var bc = Math.abs(bf.y - be.y);
            return Math.round(Math.sqrt(bd * bd + bc * bc))
        }
        function a8(bc, bd) {
            var be = (bd / bc) * 1;
            return be.toFixed(2)
        }
        function aq() {
            if (H < 1) {
                return A
            } else {
                return c
            }
        }
        function aS(bd, bc) {
            return Math.round(Math.sqrt(Math.pow(bc.x - bd.x, 2) + Math.pow(bc.y - bd.y, 2)))
        }
        function aE(bf, bd) {
            var bc = bf.x - bd.x;
            var bh = bd.y - bf.y;
            var be = Math.atan2(bh, bc);
            var bg = Math.round(be * 180 / Math.PI);
            if (bg < 0) {
                bg = 360 - Math.abs(bg)
            }
            return bg
        }
        function aL(bd, bc) {
            var be = aE(bd, bc);
            if ((be <= 45) && (be >= 0)) {
                return p
            } else {
                if ((be <= 360) && (be >= 315)) {
                    return p
                } else {
                    if ((be >= 135) && (be <= 225)) {
                        return o
                    } else {
                        if ((be > 45) && (be < 135)) {
                            return x
                        } else {
                            return e
                        }
                    }
                }
            }
        }
        function ar() {
            var bc = new Date();
            return bc.getTime()
        }
        function aY(bc) {
            bc = f(bc);
            var be = bc.offset();
            var bd = {
                left: be.left,
                right: be.left + bc.outerWidth(),
                top: be.top,
                bottom: be.top + bc.outerHeight()
            };
            return bd
        }
        function F(bc, bd) {
            return (bc.x > bd.left && bc.x < bd.right && bc.y > bd.top && bc.y < bd.bottom)
        }
    }
}));
;(function($) {
    function sc_setScroll(a, b, c) {
        return "transition" == c.transition && "swing" == b && (b = "ease"),
        {
            anims: [],
            duration: a,
            orgDuration: a,
            easing: b,
            startTime: getTime()
        }
    }
    function sc_startScroll(a, b) {
        for (var c = 0, d = a.anims.length; d > c; c++) {
            var e = a.anims[c];
            e && e[0][b.transition](e[1], a.duration, a.easing, e[2])
        }
    }
    function sc_stopScroll(a, b) {
        is_boolean(b) || (b = !0),
        is_object(a.pre) && sc_stopScroll(a.pre, b);
        for (var c = 0, d = a.anims.length; d > c; c++) {
            var e = a.anims[c];
            e[0].stop(!0),
            b && (e[0].css(e[1]),
            is_function(e[2]) && e[2]())
        }
        is_object(a.post) && sc_stopScroll(a.post, b)
    }
    function sc_afterScroll(a, b, c) {
        switch (b && b.remove(),
        c.fx) {
        case "fade":
        case "crossfade":
        case "cover-fade":
        case "uncover-fade":
            a.css("opacity", 1),
            a.css("filter", "")
        }
    }
    function sc_fireCallbacks(a, b, c, d, e) {
        if (b[c] && b[c].call(a, d),
        e[c].length)
            for (var f = 0, g = e[c].length; g > f; f++)
                e[c][f].call(a, d);
        return []
    }
    function sc_fireQueue(a, b, c) {
        return b.length && (a.trigger(cf_e(b[0][0], c), b[0][1]),
        b.shift()),
        b
    }
    function sc_hideHiddenItems(a) {
        a.each(function() {
            var a = $(this);
            a.data("_cfs_isHidden", a.is(":hidden")).hide()
        })
    }
    function sc_showHiddenItems(a) {
        a && a.each(function() {
            var a = $(this);
            a.data("_cfs_isHidden") || a.show()
        })
    }
    function sc_clearTimers(a) {
        return a.auto && clearTimeout(a.auto),
        a.progress && clearInterval(a.progress),
        a
    }
    function sc_mapCallbackArguments(a, b, c, d, e, f, g) {
        return {
            width: g.width,
            height: g.height,
            items: {
                old: a,
                skipped: b,
                visible: c
            },
            scroll: {
                items: d,
                direction: e,
                duration: f
            }
        }
    }
    function sc_getDuration(a, b, c, d) {
        var e = a.duration;
        return "none" == a.fx ? 0 : ("auto" == e ? e = b.scroll.duration / b.scroll.items * c : 10 > e && (e = d / e),
        1 > e ? 0 : ("fade" == a.fx && (e /= 2),
        Math.round(e)))
    }
    function nv_showNavi(a, b, c) {
        var d = is_number(a.items.minimum) ? a.items.minimum : a.items.visible + 1;
        if ("show" == b || "hide" == b)
            var e = b;
        else if (d > b) {
            debug(c, "Not enough items (" + b + " total, " + d + " needed): Hiding navigation.");
            var e = "hide"
        } else
            var e = "show";
        var f = "show" == e ? "removeClass" : "addClass"
          , g = cf_c("hidden", c);
        a.auto.button && a.auto.button[e]()[f](g),
        a.prev.button && a.prev.button[e]()[f](g),
        a.next.button && a.next.button[e]()[f](g),
        a.pagination.container && a.pagination.container[e]()[f](g)
    }
    function nv_enableNavi(a, b, c) {
        if (!a.circular && !a.infinite) {
            var d = "removeClass" == b || "addClass" == b ? b : !1
              , e = cf_c("disabled", c);
            if (a.auto.button && d && a.auto.button[d](e),
            a.prev.button) {
                var f = d || 0 == b ? "addClass" : "removeClass";
                a.prev.button[f](e)
            }
            if (a.next.button) {
                var f = d || b == a.items.visible ? "addClass" : "removeClass";
                a.next.button[f](e)
            }
        }
    }
    function go_getObject(a, b) {
        return is_function(b) ? b = b.call(a) : is_undefined(b) && (b = {}),
        b
    }
    function go_getItemsObject(a, b) {
        return b = go_getObject(a, b),
        is_number(b) ? b = {
            visible: b
        } : "variable" == b ? b = {
            visible: b,
            width: b,
            height: b
        } : is_object(b) || (b = {}),
        b
    }
    function go_getScrollObject(a, b) {
        return b = go_getObject(a, b),
        is_number(b) ? b = 50 >= b ? {
            items: b
        } : {
            duration: b
        } : is_string(b) ? b = {
            easing: b
        } : is_object(b) || (b = {}),
        b
    }
    function go_getNaviObject(a, b) {
        if (b = go_getObject(a, b),
        is_string(b)) {
            var c = cf_getKeyCode(b);
            b = -1 == c ? $(b) : c
        }
        return b
    }
    function go_getAutoObject(a, b) {
        return b = go_getNaviObject(a, b),
        is_jquery(b) ? b = {
            button: b
        } : is_boolean(b) ? b = {
            play: b
        } : is_number(b) && (b = {
            timeoutDuration: b
        }),
        b.progress && (is_string(b.progress) || is_jquery(b.progress)) && (b.progress = {
            bar: b.progress
        }),
        b
    }
    function go_complementAutoObject(a, b) {
        return is_function(b.button) && (b.button = b.button.call(a)),
        is_string(b.button) && (b.button = $(b.button)),
        is_boolean(b.play) || (b.play = !0),
        is_number(b.delay) || (b.delay = 0),
        is_undefined(b.pauseOnEvent) && (b.pauseOnEvent = !0),
        is_boolean(b.pauseOnResize) || (b.pauseOnResize = !0),
        is_number(b.timeoutDuration) || (b.timeoutDuration = 10 > b.duration ? 2500 : 5 * b.duration),
        b.progress && (is_function(b.progress.bar) && (b.progress.bar = b.progress.bar.call(a)),
        is_string(b.progress.bar) && (b.progress.bar = $(b.progress.bar)),
        b.progress.bar ? (is_function(b.progress.updater) || (b.progress.updater = $.fn.carouFredSel.progressbarUpdater),
        is_number(b.progress.interval) || (b.progress.interval = 50)) : b.progress = !1),
        b
    }
    function go_getPrevNextObject(a, b) {
        return b = go_getNaviObject(a, b),
        is_jquery(b) ? b = {
            button: b
        } : is_number(b) && (b = {
            key: b
        }),
        b
    }
    function go_complementPrevNextObject(a, b) {
        return is_function(b.button) && (b.button = b.button.call(a)),
        is_string(b.button) && (b.button = $(b.button)),
        is_string(b.key) && (b.key = cf_getKeyCode(b.key)),
        b
    }
    function go_getPaginationObject(a, b) {
        return b = go_getNaviObject(a, b),
        is_jquery(b) ? b = {
            container: b
        } : is_boolean(b) && (b = {
            keys: b
        }),
        b
    }
    function go_complementPaginationObject(a, b) {
        return is_function(b.container) && (b.container = b.container.call(a)),
        is_string(b.container) && (b.container = $(b.container)),
        is_number(b.items) || (b.items = !1),
        is_boolean(b.keys) || (b.keys = !1),
        is_function(b.anchorBuilder) || is_false(b.anchorBuilder) || (b.anchorBuilder = $.fn.carouFredSel.pageAnchorBuilder),
        is_number(b.deviation) || (b.deviation = 0),
        b
    }
    function go_getSwipeObject(a, b) {
        return is_function(b) && (b = b.call(a)),
        is_undefined(b) && (b = {
            onTouch: !1
        }),
        is_true(b) ? b = {
            onTouch: b
        } : is_number(b) && (b = {
            items: b
        }),
        b
    }
    function go_complementSwipeObject(a, b) {
        return is_boolean(b.onTouch) || (b.onTouch = !0),
        is_boolean(b.onMouse) || (b.onMouse = !1),
        is_object(b.options) || (b.options = {}),
        is_boolean(b.options.triggerOnTouchEnd) || (b.options.triggerOnTouchEnd = !1),
        b
    }
    function go_getMousewheelObject(a, b) {
        return is_function(b) && (b = b.call(a)),
        is_true(b) ? b = {} : is_number(b) ? b = {
            items: b
        } : is_undefined(b) && (b = !1),
        b
    }
    function go_complementMousewheelObject(a, b) {
        return b
    }
    function gn_getItemIndex(a, b, c, d, e) {
        if (is_string(a) && (a = $(a, e)),
        is_object(a) && (a = $(a, e)),
        is_jquery(a) ? (a = e.children().index(a),
        is_boolean(c) || (c = !1)) : is_boolean(c) || (c = !0),
        is_number(a) || (a = 0),
        is_number(b) || (b = 0),
        c && (a += d.first),
        a += b,
        d.total > 0) {
            for (; a >= d.total; )
                a -= d.total;
            for (; 0 > a; )
                a += d.total
        }
        return a
    }
    function gn_getVisibleItemsPrev(a, b, c) {
        for (var d = 0, e = 0, f = c; f >= 0; f--) {
            var g = a.eq(f);
            if (d += g.is(":visible") ? g[b.d.outerWidth](!0) : 0,
            d > b.maxDimension)
                return e;
            0 == f && (f = a.length),
            e++
        }
    }
    function gn_getVisibleItemsPrevFilter(a, b, c) {
        return gn_getItemsPrevFilter(a, b.items.filter, b.items.visibleConf.org, c)
    }
    function gn_getScrollItemsPrevFilter(a, b, c, d) {
        return gn_getItemsPrevFilter(a, b.items.filter, d, c)
    }
    function gn_getItemsPrevFilter(a, b, c, d) {
        for (var e = 0, f = 0, g = d, h = a.length; g >= 0; g--) {
            if (f++,
            f == h)
                return f;
            var i = a.eq(g);
            if (i.is(b) && (e++,
            e == c))
                return f;
            0 == g && (g = h)
        }
    }
    function gn_getVisibleOrg(a, b) {
        return b.items.visibleConf.org || a.children().slice(0, b.items.visible).filter(b.items.filter).length
    }
    function gn_getVisibleItemsNext(a, b, c) {
        for (var d = 0, e = 0, f = c, g = a.length - 1; g >= f; f++) {
            var h = a.eq(f);
            if (d += h.is(":visible") ? h[b.d.outerWidth](!0) : 0,
            d > b.maxDimension)
                return e;
            if (e++,
            e == g + 1)
                return e;
            f == g && (f = -1)
        }
    }
    function gn_getVisibleItemsNextTestCircular(a, b, c, d) {
        var e = gn_getVisibleItemsNext(a, b, c);
        return b.circular || c + e > d && (e = d - c),
        e
    }
    function gn_getVisibleItemsNextFilter(a, b, c) {
        return gn_getItemsNextFilter(a, b.items.filter, b.items.visibleConf.org, c, b.circular)
    }
    function gn_getScrollItemsNextFilter(a, b, c, d) {
        return gn_getItemsNextFilter(a, b.items.filter, d + 1, c, b.circular) - 1
    }
    function gn_getItemsNextFilter(a, b, c, d) {
        for (var f = 0, g = 0, h = d, i = a.length - 1; i >= h; h++) {
            if (g++,
            g >= i)
                return g;
            var j = a.eq(h);
            if (j.is(b) && (f++,
            f == c))
                return g;
            h == i && (h = -1)
        }
    }
    function gi_getCurrentItems(a, b) {
        return a.slice(0, b.items.visible)
    }
    function gi_getOldItemsPrev(a, b, c) {
        return a.slice(c, b.items.visibleConf.old + c)
    }
    function gi_getNewItemsPrev(a, b) {
        return a.slice(0, b.items.visible)
    }
    function gi_getOldItemsNext(a, b) {
        return a.slice(0, b.items.visibleConf.old)
    }
    function gi_getNewItemsNext(a, b, c) {
        return a.slice(c, b.items.visible + c)
    }
    function sz_storeMargin(a, b, c) {
        b.usePadding && (is_string(c) || (c = "_cfs_origCssMargin"),
        a.each(function() {
            var a = $(this)
              , d = parseInt(a.css(b.d.marginRight), 10);
            is_number(d) || (d = 0),
            a.data(c, d)
        }))
    }
    function sz_resetMargin(a, b, c) {
        if (b.usePadding) {
            var d = is_boolean(c) ? c : !1;
            is_number(c) || (c = 0),
            sz_storeMargin(a, b, "_cfs_tempCssMargin"),
            a.each(function() {
                var a = $(this);
                a.css(b.d.marginRight, d ? a.data("_cfs_tempCssMargin") : c + a.data("_cfs_origCssMargin"))
            })
        }
    }
    function sz_storeOrigCss(a) {
        a.each(function() {
            var a = $(this);
            a.data("_cfs_origCss", a.attr("style") || "")
        })
    }
    function sz_restoreOrigCss(a) {
        a.each(function() {
            var a = $(this);
            a.attr("style", a.data("_cfs_origCss") || "")
        })
    }
    function sz_setResponsiveSizes(a, b) {
        var d = (a.items.visible,
        a.items[a.d.width])
          , e = a[a.d.height]
          , f = is_percentage(e);
        b.each(function() {
            var b = $(this)
              , c = d - ms_getPaddingBorderMargin(b, a, "Width");
            b[a.d.width](c),
            f && b[a.d.height](ms_getPercentage(c, e))
        })
    }
    function sz_setSizes(a, b) {
        var c = a.parent()
          , d = a.children()
          , e = gi_getCurrentItems(d, b)
          , f = cf_mapWrapperSizes(ms_getSizes(e, b, !0), b, !1);
        if (c.css(f),
        b.usePadding) {
            var g = b.padding
              , h = g[b.d[1]];
            b.align && 0 > h && (h = 0);
            var i = e.last();
            i.css(b.d.marginRight, i.data("_cfs_origCssMargin") + h),
            a.css(b.d.top, g[b.d[0]]),
            a.css(b.d.left, g[b.d[3]])
        }
        return a.css(b.d.width, f[b.d.width] + 2 * ms_getTotalSize(d, b, "width")),
        a.css(b.d.height, ms_getLargestSize(d, b, "height")),
        f
    }
    function ms_getSizes(a, b, c) {
        return [ms_getTotalSize(a, b, "width", c), ms_getLargestSize(a, b, "height", c)]
    }
    function ms_getLargestSize(a, b, c, d) {
        return is_boolean(d) || (d = !1),
        is_number(b[b.d[c]]) && d ? b[b.d[c]] : is_number(b.items[b.d[c]]) ? b.items[b.d[c]] : (c = c.toLowerCase().indexOf("width") > -1 ? "outerWidth" : "outerHeight",
        ms_getTrueLargestSize(a, b, c))
    }
    function ms_getTrueLargestSize(a, b, c) {
        for (var d = 0, e = 0, f = a.length; f > e; e++) {
            var g = a.eq(e)
              , h = g.is(":visible") ? g[b.d[c]](!0) : 0;
            h > d && (d = h)
        }
        return d
    }
    function ms_getTotalSize(a, b, c, d) {
        if (is_boolean(d) || (d = !1),
        is_number(b[b.d[c]]) && d)
            return b[b.d[c]];
        if (is_number(b.items[b.d[c]]))
            return b.items[b.d[c]] * a.length;
        for (var e = c.toLowerCase().indexOf("width") > -1 ? "outerWidth" : "outerHeight", f = 0, g = 0, h = a.length; h > g; g++) {
            var i = a.eq(g);
            f += i.is(":visible") ? i[b.d[e]](!0) : 0
        }
        return f
    }
    function ms_getParentSize(a, b, c) {
        var d = a.is(":visible");
        d && a.hide();
        var e = a.parent()[b.d[c]]();
        return d && a.show(),
        e
    }
    function ms_getMaxDimension(a, b) {
        return is_number(a[a.d.width]) ? a[a.d.width] : b
    }
    function ms_hasVariableSizes(a, b, c) {
        for (var d = !1, e = !1, f = 0, g = a.length; g > f; f++) {
            var h = a.eq(f)
              , i = h.is(":visible") ? h[b.d[c]](!0) : 0;
            d === !1 ? d = i : d != i && (e = !0),
            0 == d && (e = !0)
        }
        return e
    }
    function ms_getPaddingBorderMargin(a, b, c) {
        return a[b.d["outer" + c]](!0) - a[b.d[c.toLowerCase()]]()
    }
    function ms_getPercentage(a, b) {
        if (is_percentage(b)) {
            if (b = parseInt(b.slice(0, -1), 10),
            !is_number(b))
                return a;
            a *= b / 100
        }
        return a
    }
    function cf_e(a, b, c, d, e) {
        return is_boolean(c) || (c = !0),
        is_boolean(d) || (d = !0),
        is_boolean(e) || (e = !1),
        c && (a = b.events.prefix + a),
        d && (a = a + "." + b.events.namespace),
        d && e && (a += b.serialNumber),
        a
    }
    function cf_c(a, b) {
        return is_string(b.classnames[a]) ? b.classnames[a] : a
    }
    function cf_mapWrapperSizes(a, b, c) {
        is_boolean(c) || (c = !0);
        var d = b.usePadding && c ? b.padding : [0, 0, 0, 0]
          , e = {};
        return e[b.d.width] = a[0] + d[1] + d[3],
        e[b.d.height] = a[1] + d[0] + d[2],
        e
    }
    function cf_sortParams(a, b) {
        for (var c = [], d = 0, e = a.length; e > d; d++)
            for (var f = 0, g = b.length; g > f; f++)
                if (b[f].indexOf(typeof a[d]) > -1 && is_undefined(c[f])) {
                    c[f] = a[d];
                    break
                }
        return c
    }
    function cf_getPadding(a) {
        if (is_undefined(a))
            return [0, 0, 0, 0];
        if (is_number(a))
            return [a, a, a, a];
        if (is_string(a) && (a = a.split("px").join("").split("em").join("").split(" ")),
        !is_array(a))
            return [0, 0, 0, 0];
        for (var b = 0; 4 > b; b++)
            a[b] = parseInt(a[b], 10);
        switch (a.length) {
        case 0:
            return [0, 0, 0, 0];
        case 1:
            return [a[0], a[0], a[0], a[0]];
        case 2:
            return [a[0], a[1], a[0], a[1]];
        case 3:
            return [a[0], a[1], a[2], a[1]];
        default:
            return [a[0], a[1], a[2], a[3]]
        }
    }
    function cf_getAlignPadding(a, b) {
        var c = is_number(b[b.d.width]) ? Math.ceil(b[b.d.width] - ms_getTotalSize(a, b, "width")) : 0;
        switch (b.align) {
        case "left":
            return [0, c];
        case "right":
            return [c, 0];
        case "center":
        default:
            return [Math.ceil(c / 2), Math.floor(c / 2)]
        }
    }
    function cf_getDimensions(a) {
        for (var b = [["width", "innerWidth", "outerWidth", "height", "innerHeight", "outerHeight", "left", "top", "marginRight", 0, 1, 2, 3], ["height", "innerHeight", "outerHeight", "width", "innerWidth", "outerWidth", "top", "left", "marginBottom", 3, 2, 1, 0]], c = b[0].length, d = "right" == a.direction || "left" == a.direction ? 0 : 1, e = {}, f = 0; c > f; f++)
            e[b[0][f]] = b[d][f];
        return e
    }
    function cf_getAdjust(a, b, c, d) {
        var e = a;
        if (is_function(c))
            e = c.call(d, e);
        else if (is_string(c)) {
            var f = c.split("+")
              , g = c.split("-");
            if (g.length > f.length)
                var h = !0
                  , i = g[0]
                  , j = g[1];
            else
                var h = !1
                  , i = f[0]
                  , j = f[1];
            switch (i) {
            case "even":
                e = 1 == a % 2 ? a - 1 : a;
                break;
            case "odd":
                e = 0 == a % 2 ? a - 1 : a;
                break;
            default:
                e = a
            }
            j = parseInt(j, 10),
            is_number(j) && (h && (j = -j),
            e += j)
        }
        return (!is_number(e) || 1 > e) && (e = 1),
        e
    }
    function cf_getItemsAdjust(a, b, c, d) {
        return cf_getItemAdjustMinMax(cf_getAdjust(a, b, c, d), b.items.visibleConf)
    }
    function cf_getItemAdjustMinMax(a, b) {
        return is_number(b.min) && b.min > a && (a = b.min),
        is_number(b.max) && a > b.max && (a = b.max),
        1 > a && (a = 1),
        a
    }
    function cf_getSynchArr(a) {
        is_array(a) || (a = [[a]]),
        is_array(a[0]) || (a = [a]);
        for (var b = 0, c = a.length; c > b; b++)
            is_string(a[b][0]) && (a[b][0] = $(a[b][0])),
            is_boolean(a[b][1]) || (a[b][1] = !0),
            is_boolean(a[b][2]) || (a[b][2] = !0),
            is_number(a[b][3]) || (a[b][3] = 0);
        return a
    }
    function cf_getKeyCode(a) {
        return "right" == a ? 39 : "left" == a ? 37 : "up" == a ? 38 : "down" == a ? 40 : -1
    }
    function cf_setCookie(a, b, c) {
        if (a) {
            var d = b.triggerHandler(cf_e("currentPosition", c));
            $.fn.carouFredSel.cookie.set(a, d)
        }
    }
    function cf_getCookie(a) {
        var b = $.fn.carouFredSel.cookie.get(a);
        return "" == b ? 0 : b
    }
    function in_mapCss(a, b) {
        for (var c = {}, d = 0, e = b.length; e > d; d++)
            c[b[d]] = a.css(b[d]);
        return c
    }
    function in_complementItems(a, b, c, d) {
        return is_object(a.visibleConf) || (a.visibleConf = {}),
        is_object(a.sizesConf) || (a.sizesConf = {}),
        0 == a.start && is_number(d) && (a.start = d),
        is_object(a.visible) ? (a.visibleConf.min = a.visible.min,
        a.visibleConf.max = a.visible.max,
        a.visible = !1) : is_string(a.visible) ? ("variable" == a.visible ? a.visibleConf.variable = !0 : a.visibleConf.adjust = a.visible,
        a.visible = !1) : is_function(a.visible) && (a.visibleConf.adjust = a.visible,
        a.visible = !1),
        is_string(a.filter) || (a.filter = c.filter(":hidden").length > 0 ? ":visible" : "*"),
        a[b.d.width] || (b.responsive ? (debug(!0, "Set a " + b.d.width + " for the items!"),
        a[b.d.width] = ms_getTrueLargestSize(c, b, "outerWidth")) : a[b.d.width] = ms_hasVariableSizes(c, b, "outerWidth") ? "variable" : c[b.d.outerWidth](!0)),
        a[b.d.height] || (a[b.d.height] = ms_hasVariableSizes(c, b, "outerHeight") ? "variable" : c[b.d.outerHeight](!0)),
        a.sizesConf.width = a.width,
        a.sizesConf.height = a.height,
        a
    }
    function in_complementVisibleItems(a, b) {
        return "variable" == a.items[a.d.width] && (a.items.visibleConf.variable = !0),
        a.items.visibleConf.variable || (is_number(a[a.d.width]) ? a.items.visible = Math.floor(a[a.d.width] / a.items[a.d.width]) : (a.items.visible = Math.floor(b / a.items[a.d.width]),
        a[a.d.width] = a.items.visible * a.items[a.d.width],
        a.items.visibleConf.adjust || (a.align = !1)),
        ("Infinity" == a.items.visible || 1 > a.items.visible) && (debug(!0, 'Not a valid number of visible items: Set to "variable".'),
        a.items.visibleConf.variable = !0)),
        a
    }
    function in_complementPrimarySize(a, b, c) {
        return "auto" == a && (a = ms_getTrueLargestSize(c, b, "outerWidth")),
        a
    }
    function in_complementSecondarySize(a, b, c) {
        return "auto" == a && (a = ms_getTrueLargestSize(c, b, "outerHeight")),
        a || (a = b.items[b.d.height]),
        a
    }
    function in_getAlignPadding(a, b) {
        var c = cf_getAlignPadding(gi_getCurrentItems(b, a), a);
        return a.padding[a.d[1]] = c[1],
        a.padding[a.d[3]] = c[0],
        a
    }
    function in_getResponsiveValues(a, b) {
        var d = cf_getItemAdjustMinMax(Math.ceil(a[a.d.width] / a.items[a.d.width]), a.items.visibleConf);
        d > b.length && (d = b.length);
        var e = Math.floor(a[a.d.width] / d);
        return a.items.visible = d,
        a.items[a.d.width] = e,
        a[a.d.width] = d * e,
        a
    }
    function bt_pauseOnHoverConfig(a) {
        if (is_string(a))
            var b = a.indexOf("immediate") > -1 ? !0 : !1
              , c = a.indexOf("resume") > -1 ? !0 : !1;
        else
            var b = c = !1;
        return [b, c]
    }
    function bt_mousesheelNumber(a) {
        return is_number(a) ? a : null
    }
    function is_null(a) {
        return null === a
    }
    function is_undefined(a) {
        return is_null(a) || a === void 0 || "" === a || "undefined" === a
    }
    function is_array(a) {
        return a instanceof Array
    }
    function is_jquery(a) {
        return a instanceof jQuery
    }
    function is_object(a) {
        return (a instanceof Object || "object" == typeof a) && !is_null(a) && !is_jquery(a) && !is_array(a) && !is_function(a)
    }
    function is_number(a) {
        return (a instanceof Number || "number" == typeof a) && !isNaN(a)
    }
    function is_string(a) {
        return (a instanceof String || "string" == typeof a) && !is_undefined(a) && !is_true(a) && !is_false(a)
    }
    function is_function(a) {
        return a instanceof Function || "function" == typeof a
    }
    function is_boolean(a) {
        return a instanceof Boolean || "boolean" == typeof a || is_true(a) || is_false(a)
    }
    function is_true(a) {
        return a === !0 || "true" === a
    }
    function is_false(a) {
        return a === !1 || "false" === a
    }
    function is_percentage(a) {
        return is_string(a) && "%" == a.slice(-1)
    }
    function getTime() {
        return (new Date).getTime()
    }
    function deprecated(a, b) {
        debug(!0, a + " is DEPRECATED, support for it will be removed. Use " + b + " instead.")
    }
    function debug(a, b) {
        if (!is_undefined(window.console) && !is_undefined(window.console.log)) {
            if (is_object(a)) {
                var c = " (" + a.selector + ")";
                a = a.debug
            } else
                var c = "";
            if (!a)
                return !1;
            b = is_string(b) ? "carouFredSel" + c + ": " + b : ["carouFredSel" + c + ":", b],
            window.console.log(b)
        }
        return !1
    }
    $.fn.carouFredSel || ($.fn.caroufredsel = $.fn.carouFredSel = function(options, configs) {
        if (0 == this.length)
            return debug(!0, 'No element found for "' + this.selector + '".'),
            this;
        if (this.length > 1)
            return this.each(function() {
                $(this).carouFredSel(options, configs)
            });
        var $cfs = this
          , $tt0 = this[0]
          , starting_position = !1;
        $cfs.data("_cfs_isCarousel") && (starting_position = $cfs.triggerHandler("_cfs_triggerEvent", "currentPosition"),
        $cfs.trigger("_cfs_triggerEvent", ["destroy", !0]));
        var FN = {};
        FN._init = function(a, b, c) {
            a = go_getObject($tt0, a),
            a.items = go_getItemsObject($tt0, a.items),
            a.scroll = go_getScrollObject($tt0, a.scroll),
            a.auto = go_getAutoObject($tt0, a.auto),
            a.prev = go_getPrevNextObject($tt0, a.prev),
            a.next = go_getPrevNextObject($tt0, a.next),
            a.pagination = go_getPaginationObject($tt0, a.pagination),
            a.swipe = go_getSwipeObject($tt0, a.swipe),
            a.mousewheel = go_getMousewheelObject($tt0, a.mousewheel),
            b && (opts_orig = $.extend(!0, {}, $.fn.carouFredSel.defaults, a)),
            opts = $.extend(!0, {}, $.fn.carouFredSel.defaults, a),
            opts.d = cf_getDimensions(opts),
            crsl.direction = "up" == opts.direction || "left" == opts.direction ? "next" : "prev";
            var d = $cfs.children()
              , e = ms_getParentSize($wrp, opts, "width");
            if (is_true(opts.cookie) && (opts.cookie = "caroufredsel_cookie_" + conf.serialNumber),
            opts.maxDimension = ms_getMaxDimension(opts, e),
            opts.items = in_complementItems(opts.items, opts, d, c),
            opts[opts.d.width] = in_complementPrimarySize(opts[opts.d.width], opts, d),
            opts[opts.d.height] = in_complementSecondarySize(opts[opts.d.height], opts, d),
            opts.responsive && (is_percentage(opts[opts.d.width]) || (opts[opts.d.width] = "100%")),
            is_percentage(opts[opts.d.width]) && (crsl.upDateOnWindowResize = !0,
            crsl.primarySizePercentage = opts[opts.d.width],
            opts[opts.d.width] = ms_getPercentage(e, crsl.primarySizePercentage),
            opts.items.visible || (opts.items.visibleConf.variable = !0)),
            opts.responsive ? (opts.usePadding = !1,
            opts.padding = [0, 0, 0, 0],
            opts.align = !1,
            opts.items.visibleConf.variable = !1) : (opts.items.visible || (opts = in_complementVisibleItems(opts, e)),
            opts[opts.d.width] || (!opts.items.visibleConf.variable && is_number(opts.items[opts.d.width]) && "*" == opts.items.filter ? (opts[opts.d.width] = opts.items.visible * opts.items[opts.d.width],
            opts.align = !1) : opts[opts.d.width] = "variable"),
            is_undefined(opts.align) && (opts.align = is_number(opts[opts.d.width]) ? "center" : !1),
            opts.items.visibleConf.variable && (opts.items.visible = gn_getVisibleItemsNext(d, opts, 0))),
            "*" == opts.items.filter || opts.items.visibleConf.variable || (opts.items.visibleConf.org = opts.items.visible,
            opts.items.visible = gn_getVisibleItemsNextFilter(d, opts, 0)),
            opts.items.visible = cf_getItemsAdjust(opts.items.visible, opts, opts.items.visibleConf.adjust, $tt0),
            opts.items.visibleConf.old = opts.items.visible,
            opts.responsive)
                opts.items.visibleConf.min || (opts.items.visibleConf.min = opts.items.visible),
                opts.items.visibleConf.max || (opts.items.visibleConf.max = opts.items.visible),
                opts = in_getResponsiveValues(opts, d, e);
            else
                switch (opts.padding = cf_getPadding(opts.padding),
                "top" == opts.align ? opts.align = "left" : "bottom" == opts.align && (opts.align = "right"),
                opts.align) {
                case "center":
                case "left":
                case "right":
                    "variable" != opts[opts.d.width] && (opts = in_getAlignPadding(opts, d),
                    opts.usePadding = !0);
                    break;
                default:
                    opts.align = !1,
                    opts.usePadding = 0 == opts.padding[0] && 0 == opts.padding[1] && 0 == opts.padding[2] && 0 == opts.padding[3] ? !1 : !0
                }
            is_number(opts.scroll.duration) || (opts.scroll.duration = 500),
            is_undefined(opts.scroll.items) && (opts.scroll.items = opts.responsive || opts.items.visibleConf.variable || "*" != opts.items.filter ? "visible" : opts.items.visible),
            opts.auto = $.extend(!0, {}, opts.scroll, opts.auto),
            opts.prev = $.extend(!0, {}, opts.scroll, opts.prev),
            opts.next = $.extend(!0, {}, opts.scroll, opts.next),
            opts.pagination = $.extend(!0, {}, opts.scroll, opts.pagination),
            opts.auto = go_complementAutoObject($tt0, opts.auto),
            opts.prev = go_complementPrevNextObject($tt0, opts.prev),
            opts.next = go_complementPrevNextObject($tt0, opts.next),
            opts.pagination = go_complementPaginationObject($tt0, opts.pagination),
            opts.swipe = go_complementSwipeObject($tt0, opts.swipe),
            opts.mousewheel = go_complementMousewheelObject($tt0, opts.mousewheel),
            opts.synchronise && (opts.synchronise = cf_getSynchArr(opts.synchronise)),
            opts.auto.onPauseStart && (opts.auto.onTimeoutStart = opts.auto.onPauseStart,
            deprecated("auto.onPauseStart", "auto.onTimeoutStart")),
            opts.auto.onPausePause && (opts.auto.onTimeoutPause = opts.auto.onPausePause,
            deprecated("auto.onPausePause", "auto.onTimeoutPause")),
            opts.auto.onPauseEnd && (opts.auto.onTimeoutEnd = opts.auto.onPauseEnd,
            deprecated("auto.onPauseEnd", "auto.onTimeoutEnd")),
            opts.auto.pauseDuration && (opts.auto.timeoutDuration = opts.auto.pauseDuration,
            deprecated("auto.pauseDuration", "auto.timeoutDuration"))
        }
        ,
        FN._build = function() {
            $cfs.data("_cfs_isCarousel", !0);
            var a = $cfs.children()
              , b = in_mapCss($cfs, ["textAlign", "float", "position", "top", "right", "bottom", "left", "zIndex", "width", "height", "marginTop", "marginRight", "marginBottom", "marginLeft"])
              , c = "relative";
            switch (b.position) {
            case "absolute":
            case "fixed":
                c = b.position
            }
            "parent" == conf.wrapper ? sz_storeOrigCss($wrp) : $wrp.css(b),
            $wrp.css({
                overflow: "hidden",
                position: c
            }),
            sz_storeOrigCss($cfs),
            $cfs.data("_cfs_origCssZindex", b.zIndex),
            $cfs.css({
                textAlign: "left",
                "float": "none",
                position: "absolute",
                top: 0,
                right: "auto",
                bottom: "auto",
                left: 0,
                marginTop: 0,
                marginRight: 0,
                marginBottom: 0,
                marginLeft: 0
            }),
            sz_storeMargin(a, opts),
            sz_storeOrigCss(a),
            opts.responsive && sz_setResponsiveSizes(opts, a)
        }
        ,
        FN._bind_events = function() {
            FN._unbind_events(),
            $cfs.bind(cf_e("stop", conf), function(a, b) {
                return a.stopPropagation(),
                crsl.isStopped || opts.auto.button && opts.auto.button.addClass(cf_c("stopped", conf)),
                crsl.isStopped = !0,
                opts.auto.play && (opts.auto.play = !1,
                $cfs.trigger(cf_e("pause", conf), b)),
                !0
            }),
            $cfs.bind(cf_e("finish", conf), function(a) {
                return a.stopPropagation(),
                crsl.isScrolling && sc_stopScroll(scrl),
                !0
            }),
            $cfs.bind(cf_e("pause", conf), function(a, b, c) {
                if (a.stopPropagation(),
                tmrs = sc_clearTimers(tmrs),
                b && crsl.isScrolling) {
                    scrl.isStopped = !0;
                    var d = getTime() - scrl.startTime;
                    scrl.duration -= d,
                    scrl.pre && (scrl.pre.duration -= d),
                    scrl.post && (scrl.post.duration -= d),
                    sc_stopScroll(scrl, !1)
                }
                if (crsl.isPaused || crsl.isScrolling || c && (tmrs.timePassed += getTime() - tmrs.startTime),
                crsl.isPaused || opts.auto.button && opts.auto.button.addClass(cf_c("paused", conf)),
                crsl.isPaused = !0,
                opts.auto.onTimeoutPause) {
                    var e = opts.auto.timeoutDuration - tmrs.timePassed
                      , f = 100 - Math.ceil(100 * e / opts.auto.timeoutDuration);
                    opts.auto.onTimeoutPause.call($tt0, f, e)
                }
                return !0
            }),
            $cfs.bind(cf_e("play", conf), function(a, b, c, d) {
                a.stopPropagation(),
                tmrs = sc_clearTimers(tmrs);
                var e = [b, c, d]
                  , f = ["string", "number", "boolean"]
                  , g = cf_sortParams(e, f);
                if (b = g[0],
                c = g[1],
                d = g[2],
                "prev" != b && "next" != b && (b = crsl.direction),
                is_number(c) || (c = 0),
                is_boolean(d) || (d = !1),
                d && (crsl.isStopped = !1,
                opts.auto.play = !0),
                !opts.auto.play)
                    return a.stopImmediatePropagation(),
                    debug(conf, "Carousel stopped: Not scrolling.");
                crsl.isPaused && opts.auto.button && (opts.auto.button.removeClass(cf_c("stopped", conf)),
                opts.auto.button.removeClass(cf_c("paused", conf))),
                crsl.isPaused = !1,
                tmrs.startTime = getTime();
                var h = opts.auto.timeoutDuration + c;
                return dur2 = h - tmrs.timePassed,
                perc = 100 - Math.ceil(100 * dur2 / h),
                opts.auto.progress && (tmrs.progress = setInterval(function() {
                    var a = getTime() - tmrs.startTime + tmrs.timePassed
                      , b = Math.ceil(100 * a / h);
                    opts.auto.progress.updater.call(opts.auto.progress.bar[0], b)
                }, opts.auto.progress.interval)),
                tmrs.auto = setTimeout(function() {
                    opts.auto.progress && opts.auto.progress.updater.call(opts.auto.progress.bar[0], 100),
                    opts.auto.onTimeoutEnd && opts.auto.onTimeoutEnd.call($tt0, perc, dur2),
                    crsl.isScrolling ? $cfs.trigger(cf_e("play", conf), b) : $cfs.trigger(cf_e(b, conf), opts.auto)
                }, dur2),
                opts.auto.onTimeoutStart && opts.auto.onTimeoutStart.call($tt0, perc, dur2),
                !0
            }),
            $cfs.bind(cf_e("resume", conf), function(a) {
                return a.stopPropagation(),
                scrl.isStopped ? (scrl.isStopped = !1,
                crsl.isPaused = !1,
                crsl.isScrolling = !0,
                scrl.startTime = getTime(),
                sc_startScroll(scrl, conf)) : $cfs.trigger(cf_e("play", conf)),
                !0
            }),
            $cfs.bind(cf_e("prev", conf) + " " + cf_e("next", conf), function(a, b, c, d, e) {
                if (a.stopPropagation(),
                crsl.isStopped || $cfs.is(":hidden"))
                    return a.stopImmediatePropagation(),
                    debug(conf, "Carousel stopped or hidden: Not scrolling.");
                var f = is_number(opts.items.minimum) ? opts.items.minimum : opts.items.visible + 1;
                if (f > itms.total)
                    return a.stopImmediatePropagation(),
                    debug(conf, "Not enough items (" + itms.total + " total, " + f + " needed): Not scrolling.");
                var g = [b, c, d, e]
                  , h = ["object", "number/string", "function", "boolean"]
                  , i = cf_sortParams(g, h);
                b = i[0],
                c = i[1],
                d = i[2],
                e = i[3];
                var j = a.type.slice(conf.events.prefix.length);
                if (is_object(b) || (b = {}),
                is_function(d) && (b.onAfter = d),
                is_boolean(e) && (b.queue = e),
                b = $.extend(!0, {}, opts[j], b),
                b.conditions && !b.conditions.call($tt0, j))
                    return a.stopImmediatePropagation(),
                    debug(conf, 'Callback "conditions" returned false.');
                if (!is_number(c)) {
                    if ("*" != opts.items.filter)
                        c = "visible";
                    else
                        for (var k = [c, b.items, opts[j].items], i = 0, l = k.length; l > i; i++)
                            if (is_number(k[i]) || "page" == k[i] || "visible" == k[i]) {
                                c = k[i];
                                break
                            }
                    switch (c) {
                    case "page":
                        return a.stopImmediatePropagation(),
                        $cfs.triggerHandler(cf_e(j + "Page", conf), [b, d]);
                    case "visible":
                        opts.items.visibleConf.variable || "*" != opts.items.filter || (c = opts.items.visible)
                    }
                }
                if (scrl.isStopped)
                    return $cfs.trigger(cf_e("resume", conf)),
                    $cfs.trigger(cf_e("queue", conf), [j, [b, c, d]]),
                    a.stopImmediatePropagation(),
                    debug(conf, "Carousel resumed scrolling.");
                if (b.duration > 0 && crsl.isScrolling)
                    return b.queue && ("last" == b.queue && (queu = []),
                    ("first" != b.queue || 0 == queu.length) && $cfs.trigger(cf_e("queue", conf), [j, [b, c, d]])),
                    a.stopImmediatePropagation(),
                    debug(conf, "Carousel currently scrolling.");
                if (tmrs.timePassed = 0,
                $cfs.trigger(cf_e("slide_" + j, conf), [b, c]),
                opts.synchronise)
                    for (var m = opts.synchronise, n = [b, c], o = 0, l = m.length; l > o; o++) {
                        var p = j;
                        m[o][2] || (p = "prev" == p ? "next" : "prev"),
                        m[o][1] || (n[0] = m[o][0].triggerHandler("_cfs_triggerEvent", ["configuration", p])),
                        n[1] = c + m[o][3],
                        m[o][0].trigger("_cfs_triggerEvent", ["slide_" + p, n])
                    }
                return !0
            }),
            $cfs.bind(cf_e("slide_prev", conf), function(a, b, c) {
                a.stopPropagation();
                var d = $cfs.children();
                if (!opts.circular && 0 == itms.first)
                    return opts.infinite && $cfs.trigger(cf_e("next", conf), itms.total - 1),
                    a.stopImmediatePropagation();
                if (sz_resetMargin(d, opts),
                !is_number(c)) {
                    if (opts.items.visibleConf.variable)
                        c = gn_getVisibleItemsPrev(d, opts, itms.total - 1);
                    else if ("*" != opts.items.filter) {
                        var e = is_number(b.items) ? b.items : gn_getVisibleOrg($cfs, opts);
                        c = gn_getScrollItemsPrevFilter(d, opts, itms.total - 1, e)
                    } else
                        c = opts.items.visible;
                    c = cf_getAdjust(c, opts, b.items, $tt0)
                }
                if (opts.circular || itms.total - c < itms.first && (c = itms.total - itms.first),
                opts.items.visibleConf.old = opts.items.visible,
                opts.items.visibleConf.variable) {
                    var f = cf_getItemsAdjust(gn_getVisibleItemsNext(d, opts, itms.total - c), opts, opts.items.visibleConf.adjust, $tt0);
                    f >= opts.items.visible + c && itms.total > c && (c++,
                    f = cf_getItemsAdjust(gn_getVisibleItemsNext(d, opts, itms.total - c), opts, opts.items.visibleConf.adjust, $tt0)),
                    opts.items.visible = f
                } else if ("*" != opts.items.filter) {
                    var f = gn_getVisibleItemsNextFilter(d, opts, itms.total - c);
                    opts.items.visible = cf_getItemsAdjust(f, opts, opts.items.visibleConf.adjust, $tt0)
                }
                if (sz_resetMargin(d, opts, !0),
                0 == c)
                    return a.stopImmediatePropagation(),
                    debug(conf, "0 items to scroll: Not scrolling.");
                for (debug(conf, "Scrolling " + c + " items backward."),
                itms.first += c; itms.first >= itms.total; )
                    itms.first -= itms.total;
                opts.circular || (0 == itms.first && b.onEnd && b.onEnd.call($tt0, "prev"),
                opts.infinite || nv_enableNavi(opts, itms.first, conf)),
                $cfs.children().slice(itms.total - c, itms.total).prependTo($cfs),
                itms.total < opts.items.visible + c && $cfs.children().slice(0, opts.items.visible + c - itms.total).clone(!0).appendTo($cfs);
                var d = $cfs.children()
                  , g = gi_getOldItemsPrev(d, opts, c)
                  , h = gi_getNewItemsPrev(d, opts)
                  , i = d.eq(c - 1)
                  , j = g.last()
                  , k = h.last();
                sz_resetMargin(d, opts);
                var l = 0
                  , m = 0;
                if (opts.align) {
                    var n = cf_getAlignPadding(h, opts);
                    l = n[0],
                    m = n[1]
                }
                var o = 0 > l ? opts.padding[opts.d[3]] : 0
                  , p = !1
                  , q = $();
                if (c > opts.items.visible && (q = d.slice(opts.items.visibleConf.old, c),
                "directscroll" == b.fx)) {
                    var r = opts.items[opts.d.width];
                    p = q,
                    i = k,
                    sc_hideHiddenItems(p),
                    opts.items[opts.d.width] = "variable"
                }
                var s = !1
                  , t = ms_getTotalSize(d.slice(0, c), opts, "width")
                  , u = cf_mapWrapperSizes(ms_getSizes(h, opts, !0), opts, !opts.usePadding)
                  , v = 0
                  , w = {}
                  , x = {}
                  , y = {}
                  , z = {}
                  , A = {}
                  , B = {}
                  , C = {}
                  , D = sc_getDuration(b, opts, c, t);
                switch (b.fx) {
                case "cover":
                case "cover-fade":
                    v = ms_getTotalSize(d.slice(0, opts.items.visible), opts, "width")
                }
                p && (opts.items[opts.d.width] = r),
                sz_resetMargin(d, opts, !0),
                m >= 0 && sz_resetMargin(j, opts, opts.padding[opts.d[1]]),
                l >= 0 && sz_resetMargin(i, opts, opts.padding[opts.d[3]]),
                opts.align && (opts.padding[opts.d[1]] = m,
                opts.padding[opts.d[3]] = l),
                B[opts.d.left] = -(t - o),
                C[opts.d.left] = -(v - o),
                x[opts.d.left] = u[opts.d.width];
                var E = function() {}
                  , F = function() {}
                  , G = function() {}
                  , H = function() {}
                  , I = function() {}
                  , J = function() {}
                  , K = function() {}
                  , L = function() {}
                  , M = function() {}
                  , N = function() {}
                  , O = function() {};
                switch (b.fx) {
                case "crossfade":
                case "cover":
                case "cover-fade":
                case "uncover":
                case "uncover-fade":
                    s = $cfs.clone(!0).appendTo($wrp)
                }
                switch (b.fx) {
                case "crossfade":
                case "uncover":
                case "uncover-fade":
                    s.children().slice(0, c).remove(),
                    s.children().slice(opts.items.visibleConf.old).remove();
                    break;
                case "cover":
                case "cover-fade":
                    s.children().slice(opts.items.visible).remove(),
                    s.css(C)
                }
                if ($cfs.css(B),
                scrl = sc_setScroll(D, b.easing, conf),
                w[opts.d.left] = opts.usePadding ? opts.padding[opts.d[3]] : 0,
                ("variable" == opts[opts.d.width] || "variable" == opts[opts.d.height]) && (E = function() {
                    $wrp.css(u)
                }
                ,
                F = function() {
                    scrl.anims.push([$wrp, u])
                }
                ),
                opts.usePadding) {
                    switch (k.not(i).length && (y[opts.d.marginRight] = i.data("_cfs_origCssMargin"),
                    0 > l ? i.css(y) : (K = function() {
                        i.css(y)
                    }
                    ,
                    L = function() {
                        scrl.anims.push([i, y])
                    }
                    )),
                    b.fx) {
                    case "cover":
                    case "cover-fade":
                        s.children().eq(c - 1).css(y)
                    }
                    k.not(j).length && (z[opts.d.marginRight] = j.data("_cfs_origCssMargin"),
                    G = function() {
                        j.css(z)
                    }
                    ,
                    H = function() {
                        scrl.anims.push([j, z])
                    }
                    ),
                    m >= 0 && (A[opts.d.marginRight] = k.data("_cfs_origCssMargin") + opts.padding[opts.d[1]],
                    I = function() {
                        k.css(A)
                    }
                    ,
                    J = function() {
                        scrl.anims.push([k, A])
                    }
                    )
                }
                O = function() {
                    $cfs.css(w)
                }
                ;
                var P = opts.items.visible + c - itms.total;
                N = function() {
                    if (P > 0 && ($cfs.children().slice(itms.total).remove(),
                    g = $($cfs.children().slice(itms.total - (opts.items.visible - P)).get().concat($cfs.children().slice(0, P).get()))),
                    sc_showHiddenItems(p),
                    opts.usePadding) {
                        var a = $cfs.children().eq(opts.items.visible + c - 1);
                        a.css(opts.d.marginRight, a.data("_cfs_origCssMargin"))
                    }
                }
                ;
                var Q = sc_mapCallbackArguments(g, q, h, c, "prev", D, u);
                switch (M = function() {
                    sc_afterScroll($cfs, s, b),
                    crsl.isScrolling = !1,
                    clbk.onAfter = sc_fireCallbacks($tt0, b, "onAfter", Q, clbk),
                    queu = sc_fireQueue($cfs, queu, conf),
                    crsl.isPaused || $cfs.trigger(cf_e("play", conf))
                }
                ,
                crsl.isScrolling = !0,
                tmrs = sc_clearTimers(tmrs),
                clbk.onBefore = sc_fireCallbacks($tt0, b, "onBefore", Q, clbk),
                b.fx) {
                case "none":
                    $cfs.css(w),
                    E(),
                    G(),
                    I(),
                    K(),
                    O(),
                    N(),
                    M();
                    break;
                case "fade":
                    scrl.anims.push([$cfs, {
                        opacity: 0
                    }, function() {
                        E(),
                        G(),
                        I(),
                        K(),
                        O(),
                        N(),
                        scrl = sc_setScroll(D, b.easing, conf),
                        scrl.anims.push([$cfs, {
                            opacity: 1
                        }, M]),
                        sc_startScroll(scrl, conf)
                    }
                    ]);
                    break;
                case "crossfade":
                    $cfs.css({
                        opacity: 0
                    }),
                    scrl.anims.push([s, {
                        opacity: 0
                    }]),
                    scrl.anims.push([$cfs, {
                        opacity: 1
                    }, M]),
                    F(),
                    G(),
                    I(),
                    K(),
                    O(),
                    N();
                    break;
                case "cover":
                    scrl.anims.push([s, w, function() {
                        G(),
                        I(),
                        K(),
                        O(),
                        N(),
                        M()
                    }
                    ]),
                    F();
                    break;
                case "cover-fade":
                    scrl.anims.push([$cfs, {
                        opacity: 0
                    }]),
                    scrl.anims.push([s, w, function() {
                        G(),
                        I(),
                        K(),
                        O(),
                        N(),
                        M()
                    }
                    ]),
                    F();
                    break;
                case "uncover":
                    scrl.anims.push([s, x, M]),
                    F(),
                    G(),
                    I(),
                    K(),
                    O(),
                    N();
                    break;
                case "uncover-fade":
                    $cfs.css({
                        opacity: 0
                    }),
                    scrl.anims.push([$cfs, {
                        opacity: 1
                    }]),
                    scrl.anims.push([s, x, M]),
                    F(),
                    G(),
                    I(),
                    K(),
                    O(),
                    N();
                    break;
                default:
                    scrl.anims.push([$cfs, w, function() {
                        N(),
                        M()
                    }
                    ]),
                    F(),
                    H(),
                    J(),
                    L()
                }
                return sc_startScroll(scrl, conf),
                cf_setCookie(opts.cookie, $cfs, conf),
                $cfs.trigger(cf_e("updatePageStatus", conf), [!1, u]),
                !0
            }),
            $cfs.bind(cf_e("slide_next", conf), function(a, b, c) {
                a.stopPropagation();
                var d = $cfs.children();
                if (!opts.circular && itms.first == opts.items.visible)
                    return opts.infinite && $cfs.trigger(cf_e("prev", conf), itms.total - 1),
                    a.stopImmediatePropagation();
                if (sz_resetMargin(d, opts),
                !is_number(c)) {
                    if ("*" != opts.items.filter) {
                        var e = is_number(b.items) ? b.items : gn_getVisibleOrg($cfs, opts);
                        c = gn_getScrollItemsNextFilter(d, opts, 0, e)
                    } else
                        c = opts.items.visible;
                    c = cf_getAdjust(c, opts, b.items, $tt0)
                }
                var f = 0 == itms.first ? itms.total : itms.first;
                if (!opts.circular) {
                    if (opts.items.visibleConf.variable)
                        var g = gn_getVisibleItemsNext(d, opts, c)
                          , e = gn_getVisibleItemsPrev(d, opts, f - 1);
                    else
                        var g = opts.items.visible
                          , e = opts.items.visible;
                    c + g > f && (c = f - e)
                }
                if (opts.items.visibleConf.old = opts.items.visible,
                opts.items.visibleConf.variable) {
                    for (var g = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(d, opts, c, f), opts, opts.items.visibleConf.adjust, $tt0); opts.items.visible - c >= g && itms.total > c; )
                        c++,
                        g = cf_getItemsAdjust(gn_getVisibleItemsNextTestCircular(d, opts, c, f), opts, opts.items.visibleConf.adjust, $tt0);
                    opts.items.visible = g
                } else if ("*" != opts.items.filter) {
                    var g = gn_getVisibleItemsNextFilter(d, opts, c);
                    opts.items.visible = cf_getItemsAdjust(g, opts, opts.items.visibleConf.adjust, $tt0)
                }
                if (sz_resetMargin(d, opts, !0),
                0 == c)
                    return a.stopImmediatePropagation(),
                    debug(conf, "0 items to scroll: Not scrolling.");
                for (debug(conf, "Scrolling " + c + " items forward."),
                itms.first -= c; 0 > itms.first; )
                    itms.first += itms.total;
                opts.circular || (itms.first == opts.items.visible && b.onEnd && b.onEnd.call($tt0, "next"),
                opts.infinite || nv_enableNavi(opts, itms.first, conf)),
                itms.total < opts.items.visible + c && $cfs.children().slice(0, opts.items.visible + c - itms.total).clone(!0).appendTo($cfs);
                var d = $cfs.children()
                  , h = gi_getOldItemsNext(d, opts)
                  , i = gi_getNewItemsNext(d, opts, c)
                  , j = d.eq(c - 1)
                  , k = h.last()
                  , l = i.last();
                sz_resetMargin(d, opts);
                var m = 0
                  , n = 0;
                if (opts.align) {
                    var o = cf_getAlignPadding(i, opts);
                    m = o[0],
                    n = o[1]
                }
                var p = !1
                  , q = $();
                if (c > opts.items.visibleConf.old && (q = d.slice(opts.items.visibleConf.old, c),
                "directscroll" == b.fx)) {
                    var r = opts.items[opts.d.width];
                    p = q,
                    j = k,
                    sc_hideHiddenItems(p),
                    opts.items[opts.d.width] = "variable"
                }
                var s = !1
                  , t = ms_getTotalSize(d.slice(0, c), opts, "width")
                  , u = cf_mapWrapperSizes(ms_getSizes(i, opts, !0), opts, !opts.usePadding)
                  , v = 0
                  , w = {}
                  , x = {}
                  , y = {}
                  , z = {}
                  , A = {}
                  , B = sc_getDuration(b, opts, c, t);
                switch (b.fx) {
                case "uncover":
                case "uncover-fade":
                    v = ms_getTotalSize(d.slice(0, opts.items.visibleConf.old), opts, "width")
                }
                p && (opts.items[opts.d.width] = r),
                opts.align && 0 > opts.padding[opts.d[1]] && (opts.padding[opts.d[1]] = 0),
                sz_resetMargin(d, opts, !0),
                sz_resetMargin(k, opts, opts.padding[opts.d[1]]),
                opts.align && (opts.padding[opts.d[1]] = n,
                opts.padding[opts.d[3]] = m),
                A[opts.d.left] = opts.usePadding ? opts.padding[opts.d[3]] : 0;
                var C = function() {}
                  , D = function() {}
                  , E = function() {}
                  , F = function() {}
                  , G = function() {}
                  , H = function() {}
                  , I = function() {}
                  , J = function() {}
                  , K = function() {};
                switch (b.fx) {
                case "crossfade":
                case "cover":
                case "cover-fade":
                case "uncover":
                case "uncover-fade":
                    s = $cfs.clone(!0).appendTo($wrp),
                    s.children().slice(opts.items.visibleConf.old).remove()
                }
                switch (b.fx) {
                case "crossfade":
                case "cover":
                case "cover-fade":
                    $cfs.css("zIndex", 1),
                    s.css("zIndex", 0)
                }
                if (scrl = sc_setScroll(B, b.easing, conf),
                w[opts.d.left] = -t,
                x[opts.d.left] = -v,
                0 > m && (w[opts.d.left] += m),
                ("variable" == opts[opts.d.width] || "variable" == opts[opts.d.height]) && (C = function() {
                    $wrp.css(u)
                }
                ,
                D = function() {
                    scrl.anims.push([$wrp, u])
                }
                ),
                opts.usePadding) {
                    var L = l.data("_cfs_origCssMargin");
                    n >= 0 && (L += opts.padding[opts.d[1]]),
                    l.css(opts.d.marginRight, L),
                    j.not(k).length && (z[opts.d.marginRight] = k.data("_cfs_origCssMargin")),
                    E = function() {
                        k.css(z)
                    }
                    ,
                    F = function() {
                        scrl.anims.push([k, z])
                    }
                    ;
                    var M = j.data("_cfs_origCssMargin");
                    m > 0 && (M += opts.padding[opts.d[3]]),
                    y[opts.d.marginRight] = M,
                    G = function() {
                        j.css(y)
                    }
                    ,
                    H = function() {
                        scrl.anims.push([j, y])
                    }
                }
                K = function() {
                    $cfs.css(A)
                }
                ;
                var N = opts.items.visible + c - itms.total;
                J = function() {
                    N > 0 && $cfs.children().slice(itms.total).remove();
                    var a = $cfs.children().slice(0, c).appendTo($cfs).last();
                    if (N > 0 && (i = gi_getCurrentItems(d, opts)),
                    sc_showHiddenItems(p),
                    opts.usePadding) {
                        if (itms.total < opts.items.visible + c) {
                            var b = $cfs.children().eq(opts.items.visible - 1);
                            b.css(opts.d.marginRight, b.data("_cfs_origCssMargin") + opts.padding[opts.d[1]])
                        }
                        a.css(opts.d.marginRight, a.data("_cfs_origCssMargin"))
                    }
                }
                ;
                var O = sc_mapCallbackArguments(h, q, i, c, "next", B, u);
                switch (I = function() {
                    $cfs.css("zIndex", $cfs.data("_cfs_origCssZindex")),
                    sc_afterScroll($cfs, s, b),
                    crsl.isScrolling = !1,
                    clbk.onAfter = sc_fireCallbacks($tt0, b, "onAfter", O, clbk),
                    queu = sc_fireQueue($cfs, queu, conf),
                    crsl.isPaused || $cfs.trigger(cf_e("play", conf))
                }
                ,
                crsl.isScrolling = !0,
                tmrs = sc_clearTimers(tmrs),
                clbk.onBefore = sc_fireCallbacks($tt0, b, "onBefore", O, clbk),
                b.fx) {
                case "none":
                    $cfs.css(w),
                    C(),
                    E(),
                    G(),
                    K(),
                    J(),
                    I();
                    break;
                case "fade":
                    scrl.anims.push([$cfs, {
                        opacity: 0
                    }, function() {
                        C(),
                        E(),
                        G(),
                        K(),
                        J(),
                        scrl = sc_setScroll(B, b.easing, conf),
                        scrl.anims.push([$cfs, {
                            opacity: 1
                        }, I]),
                        sc_startScroll(scrl, conf)
                    }
                    ]);
                    break;
                case "crossfade":
                    $cfs.css({
                        opacity: 0
                    }),
                    scrl.anims.push([s, {
                        opacity: 0
                    }]),
                    scrl.anims.push([$cfs, {
                        opacity: 1
                    }, I]),
                    D(),
                    E(),
                    G(),
                    K(),
                    J();
                    break;
                case "cover":
                    $cfs.css(opts.d.left, $wrp[opts.d.width]()),
                    scrl.anims.push([$cfs, A, I]),
                    D(),
                    E(),
                    G(),
                    J();
                    break;
                case "cover-fade":
                    $cfs.css(opts.d.left, $wrp[opts.d.width]()),
                    scrl.anims.push([s, {
                        opacity: 0
                    }]),
                    scrl.anims.push([$cfs, A, I]),
                    D(),
                    E(),
                    G(),
                    J();
                    break;
                case "uncover":
                    scrl.anims.push([s, x, I]),
                    D(),
                    E(),
                    G(),
                    K(),
                    J();
                    break;
                case "uncover-fade":
                    $cfs.css({
                        opacity: 0
                    }),
                    scrl.anims.push([$cfs, {
                        opacity: 1
                    }]),
                    scrl.anims.push([s, x, I]),
                    D(),
                    E(),
                    G(),
                    K(),
                    J();
                    break;
                default:
                    scrl.anims.push([$cfs, w, function() {
                        K(),
                        J(),
                        I()
                    }
                    ]),
                    D(),
                    F(),
                    H()
                }
                return sc_startScroll(scrl, conf),
                cf_setCookie(opts.cookie, $cfs, conf),
                $cfs.trigger(cf_e("updatePageStatus", conf), [!1, u]),
                !0
            }),
            $cfs.bind(cf_e("slideTo", conf), function(a, b, c, d, e, f, g) {
                a.stopPropagation();
                var h = [b, c, d, e, f, g]
                  , i = ["string/number/object", "number", "boolean", "object", "string", "function"]
                  , j = cf_sortParams(h, i);
                return e = j[3],
                f = j[4],
                g = j[5],
                b = gn_getItemIndex(j[0], j[1], j[2], itms, $cfs),
                0 == b ? !1 : (is_object(e) || (e = !1),
                "prev" != f && "next" != f && (f = opts.circular ? itms.total / 2 >= b ? "next" : "prev" : 0 == itms.first || itms.first > b ? "next" : "prev"),
                "prev" == f && (b = itms.total - b),
                $cfs.trigger(cf_e(f, conf), [e, b, g]),
                !0)
            }),
            $cfs.bind(cf_e("prevPage", conf), function(a, b, c) {
                a.stopPropagation();
                var d = $cfs.triggerHandler(cf_e("currentPage", conf));
                return $cfs.triggerHandler(cf_e("slideToPage", conf), [d - 1, b, "prev", c])
            }),
            $cfs.bind(cf_e("nextPage", conf), function(a, b, c) {
                a.stopPropagation();
                var d = $cfs.triggerHandler(cf_e("currentPage", conf));
                return $cfs.triggerHandler(cf_e("slideToPage", conf), [d + 1, b, "next", c])
            }),
            $cfs.bind(cf_e("slideToPage", conf), function(a, b, c, d, e) {
                a.stopPropagation(),
                is_number(b) || (b = $cfs.triggerHandler(cf_e("currentPage", conf)));
                var f = opts.pagination.items || opts.items.visible
                  , g = Math.ceil(itms.total / f) - 1;
                return 0 > b && (b = g),
                b > g && (b = 0),
                $cfs.triggerHandler(cf_e("slideTo", conf), [b * f, 0, !0, c, d, e])
            }),
            $cfs.bind(cf_e("jumpToStart", conf), function(a, b) {
                if (a.stopPropagation(),
                b = b ? gn_getItemIndex(b, 0, !0, itms, $cfs) : 0,
                b += itms.first,
                0 != b) {
                    if (itms.total > 0)
                        for (; b > itms.total; )
                            b -= itms.total;
                    $cfs.prepend($cfs.children().slice(b, itms.total))
                }
                return !0
            }),
            $cfs.bind(cf_e("synchronise", conf), function(a, b) {
                if (a.stopPropagation(),
                b)
                    b = cf_getSynchArr(b);
                else {
                    if (!opts.synchronise)
                        return debug(conf, "No carousel to synchronise.");
                    b = opts.synchronise
                }
                for (var c = $cfs.triggerHandler(cf_e("currentPosition", conf)), d = !0, e = 0, f = b.length; f > e; e++)
                    b[e][0].triggerHandler(cf_e("slideTo", conf), [c, b[e][3], !0]) || (d = !1);
                return d
            }),
            $cfs.bind(cf_e("queue", conf), function(a, b, c) {
                return a.stopPropagation(),
                is_function(b) ? b.call($tt0, queu) : is_array(b) ? queu = b : is_undefined(b) || queu.push([b, c]),
                queu
            }),
            $cfs.bind(cf_e("insertItem", conf), function(a, b, c, d, e) {
                a.stopPropagation();
                var f = [b, c, d, e]
                  , g = ["string/object", "string/number/object", "boolean", "number"]
                  , h = cf_sortParams(f, g);
                if (b = h[0],
                c = h[1],
                d = h[2],
                e = h[3],
                is_object(b) && !is_jquery(b) ? b = $(b) : is_string(b) && (b = $(b)),
                !is_jquery(b) || 0 == b.length)
                    return debug(conf, "Not a valid object.");
                is_undefined(c) && (c = "end"),
                sz_storeMargin(b, opts),
                sz_storeOrigCss(b);
                var i = c
                  , j = "before";
                "end" == c ? d ? (0 == itms.first ? (c = itms.total - 1,
                j = "after") : (c = itms.first,
                itms.first += b.length),
                0 > c && (c = 0)) : (c = itms.total - 1,
                j = "after") : c = gn_getItemIndex(c, e, d, itms, $cfs);
                var k = $cfs.children().eq(c);
                return k.length ? k[j](b) : (debug(conf, "Correct insert-position not found! Appending item to the end."),
                $cfs.append(b)),
                "end" == i || d || itms.first > c && (itms.first += b.length),
                itms.total = $cfs.children().length,
                itms.first >= itms.total && (itms.first -= itms.total),
                $cfs.trigger(cf_e("updateSizes", conf)),
                $cfs.trigger(cf_e("linkAnchors", conf)),
                !0
            }),
            $cfs.bind(cf_e("removeItem", conf), function(a, b, c, d) {
                a.stopPropagation();
                var e = [b, c, d]
                  , f = ["string/number/object", "boolean", "number"]
                  , g = cf_sortParams(e, f);
                if (b = g[0],
                c = g[1],
                d = g[2],
                b instanceof $ && b.length > 1)
                    return i = $(),
                    b.each(function() {
                        var e = $cfs.trigger(cf_e("removeItem", conf), [$(this), c, d]);
                        e && (i = i.add(e))
                    }),
                    i;
                if (is_undefined(b) || "end" == b)
                    i = $cfs.children().last();
                else {
                    b = gn_getItemIndex(b, d, c, itms, $cfs);
                    var i = $cfs.children().eq(b);
                    i.length && itms.first > b && (itms.first -= i.length)
                }
                return i && i.length && (i.detach(),
                itms.total = $cfs.children().length,
                $cfs.trigger(cf_e("updateSizes", conf))),
                i
            }),
            $cfs.bind(cf_e("onBefore", conf) + " " + cf_e("onAfter", conf), function(a, b) {
                a.stopPropagation();
                var c = a.type.slice(conf.events.prefix.length);
                return is_array(b) && (clbk[c] = b),
                is_function(b) && clbk[c].push(b),
                clbk[c]
            }),
            $cfs.bind(cf_e("currentPosition", conf), function(a, b) {
                if (a.stopPropagation(),
                0 == itms.first)
                    var c = 0;
                else
                    var c = itms.total - itms.first;
                return is_function(b) && b.call($tt0, c),
                c
            }),
            $cfs.bind(cf_e("currentPage", conf), function(a, b) {
                a.stopPropagation();
                var e, c = opts.pagination.items || opts.items.visible, d = Math.ceil(itms.total / c - 1);
                return e = 0 == itms.first ? 0 : itms.first < itms.total % c ? 0 : itms.first != c || opts.circular ? Math.round((itms.total - itms.first) / c) : d,
                0 > e && (e = 0),
                e > d && (e = d),
                is_function(b) && b.call($tt0, e),
                e
            }),
            $cfs.bind(cf_e("currentVisible", conf), function(a, b) {
                a.stopPropagation();
                var c = gi_getCurrentItems($cfs.children(), opts);
                return is_function(b) && b.call($tt0, c),
                c
            }),
            $cfs.bind(cf_e("slice", conf), function(a, b, c, d) {
                if (a.stopPropagation(),
                0 == itms.total)
                    return !1;
                var e = [b, c, d]
                  , f = ["number", "number", "function"]
                  , g = cf_sortParams(e, f);
                if (b = is_number(g[0]) ? g[0] : 0,
                c = is_number(g[1]) ? g[1] : itms.total,
                d = g[2],
                b += itms.first,
                c += itms.first,
                itms.total > 0) {
                    for (; b > itms.total; )
                        b -= itms.total;
                    for (; c > itms.total; )
                        c -= itms.total;
                    for (; 0 > b; )
                        b += itms.total;
                    for (; 0 > c; )
                        c += itms.total
                }
                var i, h = $cfs.children();
                return i = c > b ? h.slice(b, c) : $(h.slice(b, itms.total).get().concat(h.slice(0, c).get())),
                is_function(d) && d.call($tt0, i),
                i
            }),
            $cfs.bind(cf_e("isPaused", conf) + " " + cf_e("isStopped", conf) + " " + cf_e("isScrolling", conf), function(a, b) {
                a.stopPropagation();
                var c = a.type.slice(conf.events.prefix.length)
                  , d = crsl[c];
                return is_function(b) && b.call($tt0, d),
                d
            }),
            $cfs.bind(cf_e("configuration", conf), function(e, a, b, c) {
                e.stopPropagation();
                var reInit = !1;
                if (is_function(a))
                    a.call($tt0, opts);
                else if (is_object(a))
                    opts_orig = $.extend(!0, {}, opts_orig, a),
                    b !== !1 ? reInit = !0 : opts = $.extend(!0, {}, opts, a);
                else if (!is_undefined(a))
                    if (is_function(b)) {
                        var val = eval("opts." + a);
                        is_undefined(val) && (val = ""),
                        b.call($tt0, val)
                    } else {
                        if (is_undefined(b))
                            return eval("opts." + a);
                        "boolean" != typeof c && (c = !0),
                        eval("opts_orig." + a + " = b"),
                        c !== !1 ? reInit = !0 : eval("opts." + a + " = b")
                    }
                if (reInit) {
                    sz_resetMargin($cfs.children(), opts),
                    FN._init(opts_orig),
                    FN._bind_buttons();
                    var sz = sz_setSizes($cfs, opts);
                    $cfs.trigger(cf_e("updatePageStatus", conf), [!0, sz])
                }
                return opts
            }),
            $cfs.bind(cf_e("linkAnchors", conf), function(a, b, c) {
                return a.stopPropagation(),
                is_undefined(b) ? b = $("body") : is_string(b) && (b = $(b)),
                is_jquery(b) && 0 != b.length ? (is_string(c) || (c = "a.caroufredsel"),
                b.find(c).each(function() {
                    var a = this.hash || "";
                    a.length > 0 && -1 != $cfs.children().index($(a)) && $(this).unbind("click").click(function(b) {
                        b.preventDefault(),
                        $cfs.trigger(cf_e("slideTo", conf), a)
                    })
                }),
                !0) : debug(conf, "Not a valid object.")
            }),
            $cfs.bind(cf_e("updatePageStatus", conf), function(a, b) {
                if (a.stopPropagation(),
                opts.pagination.container) {
                    var d = opts.pagination.items || opts.items.visible
                      , e = Math.ceil(itms.total / d);
                    b && (opts.pagination.anchorBuilder && (opts.pagination.container.children().remove(),
                    opts.pagination.container.each(function() {
                        for (var a = 0; e > a; a++) {
                            var b = $cfs.children().eq(gn_getItemIndex(a * d, 0, !0, itms, $cfs));
                            $(this).append(opts.pagination.anchorBuilder.call(b[0], a + 1))
                        }
                    })),
                    opts.pagination.container.each(function() {
                        $(this).children().unbind(opts.pagination.event).each(function(a) {
                            $(this).bind(opts.pagination.event, function(b) {
                                b.preventDefault(),
                                $cfs.trigger(cf_e("slideTo", conf), [a * d, -opts.pagination.deviation, !0, opts.pagination])
                            })
                        })
                    }));
                    var f = $cfs.triggerHandler(cf_e("currentPage", conf)) + opts.pagination.deviation;
                    return f >= e && (f = 0),
                    0 > f && (f = e - 1),
                    opts.pagination.container.each(function() {
                        $(this).children().removeClass(cf_c("selected", conf)).eq(f).addClass(cf_c("selected", conf))
                    }),
                    !0
                }
            }),
            $cfs.bind(cf_e("updateSizes", conf), function() {
                var b = opts.items.visible
                  , c = $cfs.children()
                  , d = ms_getParentSize($wrp, opts, "width");
                if (itms.total = c.length,
                crsl.primarySizePercentage ? (opts.maxDimension = d,
                opts[opts.d.width] = ms_getPercentage(d, crsl.primarySizePercentage)) : opts.maxDimension = ms_getMaxDimension(opts, d),
                opts.responsive ? (opts.items.width = opts.items.sizesConf.width,
                opts.items.height = opts.items.sizesConf.height,
                opts = in_getResponsiveValues(opts, c, d),
                b = opts.items.visible,
                sz_setResponsiveSizes(opts, c)) : opts.items.visibleConf.variable ? b = gn_getVisibleItemsNext(c, opts, 0) : "*" != opts.items.filter && (b = gn_getVisibleItemsNextFilter(c, opts, 0)),
                !opts.circular && 0 != itms.first && b > itms.first) {
                    if (opts.items.visibleConf.variable)
                        var e = gn_getVisibleItemsPrev(c, opts, itms.first) - itms.first;
                    else if ("*" != opts.items.filter)
                        var e = gn_getVisibleItemsPrevFilter(c, opts, itms.first) - itms.first;
                    else
                        var e = opts.items.visible - itms.first;
                    debug(conf, "Preventing non-circular: sliding " + e + " items backward."),
                    $cfs.trigger(cf_e("prev", conf), e)
                }
                opts.items.visible = cf_getItemsAdjust(b, opts, opts.items.visibleConf.adjust, $tt0),
                opts.items.visibleConf.old = opts.items.visible,
                opts = in_getAlignPadding(opts, c);
                var f = sz_setSizes($cfs, opts);
                return $cfs.trigger(cf_e("updatePageStatus", conf), [!0, f]),
                nv_showNavi(opts, itms.total, conf),
                nv_enableNavi(opts, itms.first, conf),
                f
            }),
            $cfs.bind(cf_e("destroy", conf), function(a, b) {
                return a.stopPropagation(),
                tmrs = sc_clearTimers(tmrs),
                $cfs.data("_cfs_isCarousel", !1),
                $cfs.trigger(cf_e("finish", conf)),
                b && $cfs.trigger(cf_e("jumpToStart", conf)),
                sz_restoreOrigCss($cfs.children()),
                sz_restoreOrigCss($cfs),
                FN._unbind_events(),
                FN._unbind_buttons(),
                "parent" == conf.wrapper ? sz_restoreOrigCss($wrp) : $wrp.replaceWith($cfs),
                !0
            }),
            $cfs.bind(cf_e("debug", conf), function() {
                return debug(conf, "Carousel width: " + opts.width),
                debug(conf, "Carousel height: " + opts.height),
                debug(conf, "Item widths: " + opts.items.width),
                debug(conf, "Item heights: " + opts.items.height),
                debug(conf, "Number of items visible: " + opts.items.visible),
                opts.auto.play && debug(conf, "Number of items scrolled automatically: " + opts.auto.items),
                opts.prev.button && debug(conf, "Number of items scrolled backward: " + opts.prev.items),
                opts.next.button && debug(conf, "Number of items scrolled forward: " + opts.next.items),
                conf.debug
            }),
            $cfs.bind("_cfs_triggerEvent", function(a, b, c) {
                return a.stopPropagation(),
                $cfs.triggerHandler(cf_e(b, conf), c)
            })
        }
        ,
        FN._unbind_events = function() {
            $cfs.unbind(cf_e("", conf)),
            $cfs.unbind(cf_e("", conf, !1)),
            $cfs.unbind("_cfs_triggerEvent")
        }
        ,
        FN._bind_buttons = function() {
            if (FN._unbind_buttons(),
            nv_showNavi(opts, itms.total, conf),
            nv_enableNavi(opts, itms.first, conf),
            opts.auto.pauseOnHover) {
                var a = bt_pauseOnHoverConfig(opts.auto.pauseOnHover);
                $wrp.bind(cf_e("mouseenter", conf, !1), function() {
                    $cfs.trigger(cf_e("pause", conf), a)
                }).bind(cf_e("mouseleave", conf, !1), function() {
                    $cfs.trigger(cf_e("resume", conf))
                })
            }
            if (opts.auto.button && opts.auto.button.bind(cf_e(opts.auto.event, conf, !1), function(a) {
                a.preventDefault();
                var b = !1
                  , c = null;
                crsl.isPaused ? b = "play" : opts.auto.pauseOnEvent && (b = "pause",
                c = bt_pauseOnHoverConfig(opts.auto.pauseOnEvent)),
                b && $cfs.trigger(cf_e(b, conf), c)
            }),
            opts.prev.button && (opts.prev.button.bind(cf_e(opts.prev.event, conf, !1), function(a) {
                a.preventDefault(),
                $cfs.trigger(cf_e("prev", conf))
            }),
            opts.prev.pauseOnHover)) {
                var a = bt_pauseOnHoverConfig(opts.prev.pauseOnHover);
                opts.prev.button.bind(cf_e("mouseenter", conf, !1), function() {
                    $cfs.trigger(cf_e("pause", conf), a)
                }).bind(cf_e("mouseleave", conf, !1), function() {
                    $cfs.trigger(cf_e("resume", conf))
                })
            }
            if (opts.next.button && (opts.next.button.bind(cf_e(opts.next.event, conf, !1), function(a) {
                a.preventDefault(),
                $cfs.trigger(cf_e("next", conf))
            }),
            opts.next.pauseOnHover)) {
                var a = bt_pauseOnHoverConfig(opts.next.pauseOnHover);
                opts.next.button.bind(cf_e("mouseenter", conf, !1), function() {
                    $cfs.trigger(cf_e("pause", conf), a)
                }).bind(cf_e("mouseleave", conf, !1), function() {
                    $cfs.trigger(cf_e("resume", conf))
                })
            }
            if (opts.pagination.container && opts.pagination.pauseOnHover) {
                var a = bt_pauseOnHoverConfig(opts.pagination.pauseOnHover);
                opts.pagination.container.bind(cf_e("mouseenter", conf, !1), function() {
                    $cfs.trigger(cf_e("pause", conf), a)
                }).bind(cf_e("mouseleave", conf, !1), function() {
                    $cfs.trigger(cf_e("resume", conf))
                })
            }
            if ((opts.prev.key || opts.next.key) && $(document).bind(cf_e("keyup", conf, !1, !0, !0), function(a) {
                var b = a.keyCode;
                b == opts.next.key && (a.preventDefault(),
                $cfs.trigger(cf_e("next", conf))),
                b == opts.prev.key && (a.preventDefault(),
                $cfs.trigger(cf_e("prev", conf)))
            }),
            opts.pagination.keys && $(document).bind(cf_e("keyup", conf, !1, !0, !0), function(a) {
                var b = a.keyCode;
                b >= 49 && 58 > b && (b = (b - 49) * opts.items.visible,
                itms.total >= b && (a.preventDefault(),
                $cfs.trigger(cf_e("slideTo", conf), [b, 0, !0, opts.pagination])))
            }),
            $.fn.swipe) {
                var b = "ontouchstart"in window;
                if (b && opts.swipe.onTouch || !b && opts.swipe.onMouse) {
                    var c = $.extend(!0, {}, opts.prev, opts.swipe)
                      , d = $.extend(!0, {}, opts.next, opts.swipe)
                      , e = function() {
                        $cfs.trigger(cf_e("prev", conf), [c])
                    }
                      , f = function() {
                        $cfs.trigger(cf_e("next", conf), [d])
                    };
                    switch (opts.direction) {
                    case "up":
                    case "down":
                        opts.swipe.options.swipeUp = f,
                        opts.swipe.options.swipeDown = e;
                        break;
                    default:
                        opts.swipe.options.swipeLeft = f,
                        opts.swipe.options.swipeRight = e
                    }
                    crsl.swipe && $cfs.swipe("destroy"),
                    $wrp.swipe(opts.swipe.options),
                    $wrp.css("cursor", "move"),
                    crsl.swipe = !0
                }
            }
            if ($.fn.mousewheel && opts.mousewheel) {
                var g = $.extend(!0, {}, opts.prev, opts.mousewheel)
                  , h = $.extend(!0, {}, opts.next, opts.mousewheel);
                crsl.mousewheel && $wrp.unbind(cf_e("mousewheel", conf, !1)),
                $wrp.bind(cf_e("mousewheel", conf, !1), function(a, b) {
                    a.preventDefault(),
                    b > 0 ? $cfs.trigger(cf_e("prev", conf), [g]) : $cfs.trigger(cf_e("next", conf), [h])
                }),
                crsl.mousewheel = !0
            }
            if (opts.auto.play && $cfs.trigger(cf_e("play", conf), opts.auto.delay),
            crsl.upDateOnWindowResize) {
                var i = function() {
                    $cfs.trigger(cf_e("finish", conf)),
                    opts.auto.pauseOnResize && !crsl.isPaused && $cfs.trigger(cf_e("play", conf)),
                    sz_resetMargin($cfs.children(), opts),
                    $cfs.trigger(cf_e("updateSizes", conf))
                }
                  , j = $(window)
                  , k = null;
                if ($.debounce && "debounce" == conf.onWindowResize)
                    k = $.debounce(200, i);
                else if ($.throttle && "throttle" == conf.onWindowResize)
                    k = $.throttle(300, i);
                else {
                    var l = 0
                      , m = 0;
                    k = function() {
                        var a = j.width()
                          , b = j.height();
                        (a != l || b != m) && (i(),
                        l = a,
                        m = b)
                    }
                }
                j.bind(cf_e("resize", conf, !1, !0, !0), k)
            }
        }
        ,
        FN._unbind_buttons = function() {
            var b = (cf_e("", conf),
            cf_e("", conf, !1));
            var ns3 = cf_e("", conf, !1, !0, !0);
            $(document).unbind(ns3),
            $(window).unbind(ns3),
            $wrp.unbind(b),
            opts.auto.button && opts.auto.button.unbind(b),
            opts.prev.button && opts.prev.button.unbind(b),
            opts.next.button && opts.next.button.unbind(b),
            opts.pagination.container && (opts.pagination.container.unbind(b),
            opts.pagination.anchorBuilder && opts.pagination.container.children().remove()),
            crsl.swipe && ($cfs.swipe("destroy"),
            $wrp.css("cursor", "default"),
            crsl.swipe = !1),
            crsl.mousewheel && (crsl.mousewheel = !1),
            nv_showNavi(opts, "hide", conf),
            nv_enableNavi(opts, "removeClass", conf)
        }
        ,
        is_boolean(configs) && (configs = {
            debug: configs
        });
        var crsl = {
            direction: "next",
            isPaused: !0,
            isScrolling: !1,
            isStopped: !1,
            mousewheel: !1,
            swipe: !1
        }
          , itms = {
            total: $cfs.children().length,
            first: 0
        }
          , tmrs = {
            auto: null,
            progress: null,
            startTime: getTime(),
            timePassed: 0
        }
          , scrl = {
            isStopped: !1,
            duration: 0,
            startTime: 0,
            easing: "",
            anims: []
        }
          , clbk = {
            onBefore: [],
            onAfter: []
        }
          , queu = []
          , conf = $.extend(!0, {}, $.fn.carouFredSel.configs, configs)
          , opts = {}
          , opts_orig = $.extend(!0, {}, options)
          , $wrp = "parent" == conf.wrapper ? $cfs.parent() : $cfs.wrap("<" + conf.wrapper.element + ' class="' + conf.wrapper.classname + '" />').parent();
        if (conf.selector = $cfs.selector,
        conf.serialNumber = $.fn.carouFredSel.serialNumber++,
        conf.transition = conf.transition && $.fn.transition ? "transition" : "animate",
        FN._init(opts_orig, !0, starting_position),
        FN._build(),
        FN._bind_events(),
        FN._bind_buttons(),
        is_array(opts.items.start))
            var start_arr = opts.items.start;
        else {
            var start_arr = [];
            0 != opts.items.start && start_arr.push(opts.items.start)
        }
        if (opts.cookie && start_arr.unshift(parseInt(cf_getCookie(opts.cookie), 10)),
        start_arr.length > 0)
            for (var a = 0, l = start_arr.length; l > a; a++) {
                var s = start_arr[a];
                if (0 != s) {
                    if (s === !0) {
                        if (s = window.location.hash,
                        1 > s.length)
                            continue
                    } else
                        "random" === s && (s = Math.floor(Math.random() * itms.total));
                    if ($cfs.triggerHandler(cf_e("slideTo", conf), [s, 0, !0, {
                        fx: "none"
                    }]))
                        break
                }
            }
        var siz = sz_setSizes($cfs, opts)
          , itm = gi_getCurrentItems($cfs.children(), opts);
        return opts.onCreate && opts.onCreate.call($tt0, {
            width: siz.width,
            height: siz.height,
            items: itm
        }),
        $cfs.trigger(cf_e("updatePageStatus", conf), [!0, siz]),
        $cfs.trigger(cf_e("linkAnchors", conf)),
        conf.debug && $cfs.trigger(cf_e("debug", conf)),
        $cfs
    }
    ,
    $.fn.carouFredSel.serialNumber = 1,
    $.fn.carouFredSel.defaults = {
        synchronise: !1,
        infinite: !0,
        circular: !0,
        responsive: !1,
        direction: "left",
        items: {
            start: 0
        },
        scroll: {
            easing: "swing",
            duration: 500,
            pauseOnHover: !1,
            event: "click",
            queue: !1
        }
    },
    $.fn.carouFredSel.configs = {
        debug: !1,
        transition: !1,
        onWindowResize: "throttle",
        events: {
            prefix: "",
            namespace: "cfs"
        },
        wrapper: {
            element: "div",
            classname: "caroufredsel_wrapper"
        },
        classnames: {}
    },
    $.fn.carouFredSel.pageAnchorBuilder = function(a) {
        return '<a href="#"><span>' + a + "</span></a>"
    }
    ,
    $.fn.carouFredSel.progressbarUpdater = function(a) {
        $(this).css("width", a + "%")
    }
    ,
    $.fn.carouFredSel.cookie = {
        get: function(a) {
            a += "=";
            for (var b = document.cookie.split(";"), c = 0, d = b.length; d > c; c++) {
                for (var e = b[c]; " " == e.charAt(0); )
                    e = e.slice(1);
                if (0 == e.indexOf(a))
                    return e.slice(a.length)
            }
            return 0
        },
        set: function(a, b, c) {
            var d = "";
            if (c) {
                var e = new Date;
                e.setTime(e.getTime() + 1e3 * 60 * 60 * 24 * c),
                d = "; expires=" + e.toGMTString()
            }
            document.cookie = a + "=" + b + d + "; path=/"
        },
        remove: function(a) {
            $.fn.carouFredSel.cookie.set(a, "", -1)
        }
    },
    $.extend($.easing, {
        quadratic: function(a) {
            var b = a * a;
            return a * (-b * a + 4 * b - 6 * a + 4)
        },
        cubic: function(a) {
            return a * (4 * a * a - 9 * a + 6)
        },
        elastic: function(a) {
            var b = a * a;
            return a * (33 * b * b - 106 * b * a + 126 * b - 67 * a + 15)
        }
    }))
}
)(jQuery);
;(function($) {
    $(function() {
        $('.gem-testimonials').each(function() {
            var $testimonialsElement = $(this);
            var $testimonials = $('.gem-testimonial-item', $testimonialsElement);
            var $testimonialsWrap = $('<div class="gem-testimonials-carousel-wrap"/>').appendTo($testimonialsElement);
            var $testimonialsCarousel = $('<div class="gem-testimonials-carousel"/>').appendTo($testimonialsWrap);
            if ($testimonialsElement.hasClass('fullwidth-block')) {
                $testimonialsCarousel.wrap('<div class="container" />');
            }
            var $testimonialsNavigation = $('<div class="gem-testimonials-navigation"/>').appendTo($testimonialsWrap);
            var $testimonialsPrev = $('<a href="javascript:void(0);" class="gem-prev gem-testimonials-prev"/></a>').appendTo($testimonialsNavigation);
            var $testimonialsNext = $('<a href="javascript:void(0);" class="gem-next gem-testimonials-next"/></a>').appendTo($testimonialsNavigation);
            $testimonials.appendTo($testimonialsCarousel);
        });
        $('body').updateTestimonialsCarousel();
        $('.fullwidth-block').each(function() {
            $(this).on('updateTestimonialsCarousel', function() {
                $(this).updateTestimonialsCarousel();
            });
        });
        $('.gem_tab').on('tab-update', function() {
            $(this).updateTestimonialsCarousel();
        });
    });
    $.fn.updateTestimonialsCarousel = function() {
        function initTestimonialsCarousel() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initTestimonialsCarousel.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $testimonialsElement = $(this);
            var $testimonialsCarousel = $('.gem-testimonials-carousel', $testimonialsElement);
            var $testimonials = $('.gem-testimonial-item', $testimonialsCarousel);
            var $testimonialsPrev = $('.gem-testimonials-prev', $testimonialsElement);
            var $testimonialsNext = $('.gem-testimonials-next', $testimonialsElement);
            $testimonialsElement.thegemPreloader(function() {
                var $testimonialsView = $testimonialsCarousel.carouFredSel({
                    auto: ($testimonialsElement.data('autoscroll') > 0 ? $testimonialsElement.data('autoscroll') : false),
                    circular: true,
                    infinite: true,
                    width: '100%',
                    height: 'auto',
                    items: 1,
                    align: 'center',
                    responsive: true,
                    swipe: true,
                    prev: $testimonialsPrev,
                    next: $testimonialsNext,
                    scroll: {
                        pauseOnHover: true,
                        fx: 'scroll',
                        easing: 'easeInOutCubic',
                        duration: 1000,
                        onBefore: function(data) {
                            data.items.old.css({
                                opacity: 1
                            }).animate({
                                opacity: 0
                            }, 500, 'linear');
                            data.items.visible.css({
                                opacity: 0
                            }).animate({
                                opacity: 1
                            }, 1000, 'linear');
                        }
                    }
                });
            });
        }
        $('.gem-testimonials', this).add($(this).filter('.gem-testimonials')).each(initTestimonialsCarousel);
    }
}
)(jQuery);
;+function($) {
    "use strict";
    function Plugin(action, options) {
        var args;
        return args = Array.prototype.slice.call(arguments, 1),
        this.each(function() {
            var $this, data;
            $this = $(this),
            data = $this.data("vc.accordion"),
            data || (data = new Accordion($this,$.extend(!0, {}, options)),
            $this.data("vc.accordion", data)),
            "string" == typeof action && data[action].apply(data, args)
        })
    }
    var Accordion, clickHandler, old, hashNavigation;
    Accordion = function($element, options) {
        this.$element = $element,
        this.activeClass = "vc_active",
        this.animatingClass = "vc_animating",
        this.useCacheFlag = void 0,
        this.$target = void 0,
        this.$targetContent = void 0,
        this.selector = void 0,
        this.$container = void 0,
        this.animationDuration = void 0,
        this.index = 0
    }
    Accordion.transitionEvent = function() {
        var transition, transitions, el;
        el = document.createElement("vcFakeElement"),
        transitions = {
            transition: "transitionend",
            MSTransition: "msTransitionEnd",
            MozTransition: "transitionend",
            WebkitTransition: "webkitTransitionEnd"
        };
        for (transition in transitions)
            if ("undefined" != typeof el.style[transition])
                return transitions[transition]
    }
    Accordion.emulateTransitionEnd = function($el, duration) {
        var callback, called;
        called = !1,
        duration || (duration = 250),
        $el.one(Accordion.transitionName, function() {
            called = !0
        }),
        callback = function() {
            called || $el.trigger(Accordion.transitionName)
        }
        ,
        setTimeout(callback, duration)
    }
    Accordion.DEFAULT_TYPE = "collapse",
    Accordion.transitionName = Accordion.transitionEvent(),
    Accordion.prototype.controller = function(options) {
        var $this;
        $this = this.$element;
        var action = options;
        "string" != typeof action && (action = $this.data("vcAction") || this.getContainer().data("vcAction")),
        "undefined" == typeof action && (action = Accordion.DEFAULT_TYPE),
        "string" == typeof action && Plugin.call($this, action, options)
    }
    Accordion.prototype.isCacheUsed = function() {
        var useCache, that;
        return that = this,
        useCache = function() {
            return !1 !== that.$element.data("vcUseCache")
        }
        ,
        "undefined" == typeof this.useCacheFlag && (this.useCacheFlag = useCache()),
        this.useCacheFlag
    }
    Accordion.prototype.getSelector = function() {
        var findSelector, $this;
        return $this = this.$element,
        findSelector = function() {
            var selector;
            return selector = $this.data("vcTarget"),
            selector || (selector = $this.attr("href")),
            selector
        }
        ,
        this.isCacheUsed() ? ("undefined" == typeof this.selector && (this.selector = findSelector()),
        this.selector) : findSelector()
    }
    Accordion.prototype.findContainer = function() {
        var $container;
        return $container = this.$element.closest(this.$element.data("vcContainer")),
        $container.length || ($container = $("body")),
        $container
    }
    Accordion.prototype.getContainer = function() {
        return this.isCacheUsed() ? ("undefined" == typeof this.$container && (this.$container = this.findContainer()),
        this.$container) : this.findContainer()
    }
    Accordion.prototype.getTarget = function() {
        var selector, that, getTarget;
        return that = this,
        selector = that.getSelector(),
        getTarget = function() {
            var element;
            return element = that.getContainer().find(selector),
            element.length || (element = that.getContainer().filter(selector)),
            element
        }
        ,
        this.isCacheUsed() ? ("undefined" == typeof this.$target && (this.$target = getTarget()),
        this.$target) : getTarget()
    }
    Accordion.prototype.getTargetContent = function() {
        var $target, $targetContent;
        return $target = this.getTarget(),
        this.isCacheUsed() ? ("undefined" == typeof this.$targetContent && ($targetContent = $target,
        $target.data("vcContent") && ($targetContent = $target.find($target.data("vcContent")),
        $targetContent.length || ($targetContent = $target)),
        this.$targetContent = $targetContent),
        this.$targetContent) : $target.data("vcContent") && ($targetContent = $target.find($target.data("vcContent")),
        $targetContent.length) ? $targetContent : $target
    }
    Accordion.prototype.getTriggers = function() {
        var i;
        return i = 0,
        this.getContainer().find("[data-vc-accordion]").each(function() {
            var accordion, $this;
            $this = $(this),
            accordion = $this.data("vc.accordion"),
            "undefined" == typeof accordion && ($this.vcAccordion(),
            accordion = $this.data("vc.accordion")),
            accordion && accordion.setIndex && accordion.setIndex(i++)
        })
    }
    Accordion.prototype.setIndex = function(index) {
        this.index = index
    }
    Accordion.prototype.getIndex = function() {
        return this.index
    }
    Accordion.prototype.triggerEvent = function(event, opt) {
        var $event;
        "string" == typeof event && ($event = $.Event(event),
        this.$element.trigger($event, opt))
    }
    Accordion.prototype.getActiveTriggers = function() {
        var $triggers;
        return $triggers = this.getTriggers().filter(function() {
            var $this, accordion;
            return $this = $(this),
            accordion = $this.data("vc.accordion"),
            accordion.getTarget().hasClass(accordion.activeClass)
        })
    }
    Accordion.prototype.changeLocationHash = function() {
        var id, $target;
        $target = this.getTarget(),
        $target.length && (id = $target.attr("id")),
        id && (history.pushState ? history.pushState(null, null, "#" + id) : location.hash = "#" + id)
    }
    Accordion.prototype.isActive = function() {
        return this.getTarget().hasClass(this.activeClass)
    }
    Accordion.prototype.getAnimationDuration = function() {
        var findAnimationDuration, that;
        return that = this,
        findAnimationDuration = function() {
            var $targetContent, duration;
            return "undefined" == typeof Accordion.transitionName ? "0s" : ($targetContent = that.getTargetContent(),
            duration = $targetContent.css("transition-duration"),
            duration = duration.split(",")[0])
        }
        ,
        this.isCacheUsed() ? ("undefined" == typeof this.animationDuration && (this.animationDuration = findAnimationDuration()),
        this.animationDuration) : findAnimationDuration()
    }
    Accordion.prototype.getAnimationDurationMilliseconds = function() {
        var duration;
        return duration = this.getAnimationDuration(),
        "ms" === duration.substr(-2) ? parseInt(duration) : "s" === duration.substr(-1) ? Math.round(1e3 * parseFloat(duration)) : void 0
    }
    Accordion.prototype.isAnimated = function() {
        return parseFloat(this.getAnimationDuration()) > 0
    }
    Accordion.prototype.show = function(opt) {
        var $target, that, $targetContent;
        that = this;
        $target = that.getTarget();
        $targetContent = that.getTargetContent();
        if (that.isActive()) {
            return;
        }
        if (that.isAnimated()) {
            that.triggerEvent('beforeShow.vc.accordion');
            if (that.$container && ((that.$container.find('.vc_tta-tabs-container').length && that.$container.find('.vc_tta-tabs-container').is(':visible')) || (that.$container.find('.vc_pagination').length && that.$container.find('.vc_pagination').is(':visible')))) {
                $target.clearQueue().finish().queue(function(next) {
                    $targetContent.attr('style', '');
                    $targetContent.css({
                        display: 'block',
                        opacity: 0,
                    });
                    that.triggerEvent('gem.show.vc.tabs', opt);
                    if ($target.parent().outerHeight() <= $targetContent.outerHeight()) {
                        $target.parent().outerHeight($targetContent.outerHeight());
                    }
                    next();
                }).queue(function(next) {
                    that.triggerEvent('show.vc.accordion', opt);
                    $targetContent.clearQueue().finish().animate({
                        opacity: 1
                    }, 500, function() {
                        $target.addClass(that.activeClass);
                        ("object" == typeof opt && opt.hasOwnProperty("changeHash") && opt.changeHash || "undefined" == typeof opt) && that.changeLocationHash();
                        that.triggerEvent('afterShow.vc.accordion', opt);
                        $targetContent.attr('style', '');
                        $target.parent().attr('style', '');
                    });
                    next();
                });
            } else {
                $target.queue(function(next) {
                    $targetContent.one(Accordion.transitionName, function() {
                        $target.removeClass(that.animatingClass);
                        $targetContent.attr('style', '');
                        that.triggerEvent('afterShow.vc.accordion', opt);
                        that.triggerEvent('gem.show.vc.accordion', opt);
                    });
                    Accordion.emulateTransitionEnd($targetContent, that.getAnimationDurationMilliseconds() + 100);
                    next();
                }).queue(function(next) {
                    $targetContent.attr('style', '');
                    $targetContent.css({
                        position: 'absolute',
                        visibility: 'hidden',
                        display: 'block'
                    });
                    var height = $targetContent.height();
                    $targetContent.data('vcHeight', height);
                    $targetContent.attr('style', '');
                    next();
                }).queue(function(next) {
                    $targetContent.height(0);
                    $targetContent.css({
                        'padding-top': 0,
                        'padding-bottom': 0
                    });
                    next();
                }).queue(function(next) {
                    $target.addClass(that.animatingClass);
                    $target.addClass(that.activeClass);
                    ("object" == typeof opt && opt.hasOwnProperty("changeHash") && opt.changeHash || "undefined" == typeof opt) && that.changeLocationHash();
                    that.triggerEvent('show.vc.accordion', opt);
                    next();
                }).queue(function(next) {
                    var height = $targetContent.data('vcHeight');
                    $targetContent.animate({
                        'height': height
                    }, {
                        duration: that.getAnimationDurationMilliseconds(),
                        complete: function() {
                            if (!$targetContent.data('events')) {
                                $targetContent.attr('style', '');
                            }
                        }
                    });
                    $targetContent.css({
                        'padding-top': '',
                        'padding-bottom': ''
                    });
                    next();
                });
            }
        } else {
            $target.addClass(that.activeClass);
            that.triggerEvent('show.vc.accordion', opt);
        }
    }
    ;
    Accordion.prototype.hide = function(opt) {
        var $target, that, $targetContent;
        that = this;
        $target = that.getTarget();
        $targetContent = that.getTargetContent();
        if (!that.isActive()) {
            return;
        }
        if (that.isAnimated()) {
            that.triggerEvent('beforeHide.vc.accordion');
            if (that.$container && ((that.$container.find('.vc_tta-tabs-container').length && that.$container.find('.vc_tta-tabs-container').is(':visible')) || (that.$container.find('.vc_pagination').length && that.$container.find('.vc_pagination').is(':visible')))) {
                $target.queue(function(next) {
                    $targetContent.attr('style', '');
                    if ($target.parent().outerHeight() <= $targetContent.outerHeight()) {
                        $target.parent().outerHeight($targetContent.outerHeight());
                    }
                    $targetContent.css({
                        display: 'block',
                        opacity: 1,
                        position: 'absolute',
                        top: '-' + $targetContent.css('border-top-width'),
                        left: '-' + $targetContent.css('border-left-width'),
                        right: '-' + $targetContent.css('border-right-width'),
                    });
                    next();
                }).queue(function(next) {
                    that.triggerEvent('hide.vc.accordion', opt);
                    $targetContent.clearQueue().finish().animate({
                        opacity: 0
                    }, 500, function() {
                        $target.removeClass(that.activeClass);
                        $targetContent.attr('style', '');
                        $target.parent().attr('style', '');
                    });
                    next();
                });
            } else {
                $target.queue(function(next) {
                    $targetContent.one(Accordion.transitionName, function() {
                        $target.removeClass(that.animatingClass);
                        $targetContent.attr('style', '');
                        that.triggerEvent('afterHide.vc.accordion', opt);
                    });
                    Accordion.emulateTransitionEnd($targetContent, that.getAnimationDurationMilliseconds() + 100);
                    next();
                }).queue(function(next) {
                    $target.addClass(that.animatingClass);
                    $target.removeClass(that.activeClass);
                    that.triggerEvent('hide.vc.accordion', opt);
                    next();
                }).queue(function(next) {
                    var height = $targetContent.height();
                    $targetContent.height(height);
                    next();
                }).queue(function(next) {
                    $targetContent.animate({
                        'height': 0
                    }, that.getAnimationDurationMilliseconds());
                    $targetContent.css({
                        'padding-top': 0,
                        'padding-bottom': 0
                    });
                    next();
                });
            }
        } else {
            $target.removeClass(that.activeClass);
            that.triggerEvent('hide.vc.accordion', opt);
        }
    }
    ;
    Accordion.prototype.toggle = function(opt) {
        var $this;
        $this = this.$element,
        this.isActive() ? Plugin.call($this, "hide", opt) : Plugin.call($this, "show", opt)
    }
    Accordion.prototype.dropdown = function(opt) {
        var $this;
        $this = this.$element,
        this.isActive() ? Plugin.call($this, "hide", opt) : (Plugin.call($this, "show", opt),
        $(document).on("click.vc.accordion.data-api.dropdown", function(e) {
            Plugin.call($this, "hide", opt),
            $(document).off(e)
        }))
    }
    Accordion.prototype.collapse = function(opt) {
        var $this, $triggers;
        $this = this.$element,
        $triggers = this.getActiveTriggers().filter(function() {
            return $this[0] !== this
        }),
        $triggers.length && Plugin.call($triggers, "hide", opt),
        Plugin.call($this, "show", opt)
    }
    Accordion.prototype.collapseAll = function(opt) {
        var $this, $triggers;
        $this = this.$element,
        $triggers = this.getActiveTriggers().filter(function() {
            return $this[0] !== this
        }),
        $triggers.length && Plugin.call($triggers, "hide", opt),
        Plugin.call($this, "toggle", opt)
    }
    Accordion.prototype.showNext = function(opt) {
        var $triggers, $activeTriggers, activeIndex;
        if ($triggers = this.getTriggers(),
        $activeTriggers = this.getActiveTriggers(),
        $triggers.length) {
            if ($activeTriggers.length) {
                var lastActiveAccordion;
                lastActiveAccordion = $activeTriggers.eq($activeTriggers.length - 1).vcAccordion().data("vc.accordion"),
                lastActiveAccordion && lastActiveAccordion.getIndex && (activeIndex = lastActiveAccordion.getIndex())
            }
            activeIndex > -1 && activeIndex + 1 < $triggers.length ? Plugin.call($triggers.eq(activeIndex + 1), "controller", opt) : Plugin.call($triggers.eq(0), "controller", opt)
        }
    }
    Accordion.prototype.showPrev = function(opt) {
        var $triggers, $activeTriggers, activeIndex;
        if ($triggers = this.getTriggers(),
        $activeTriggers = this.getActiveTriggers(),
        $triggers.length) {
            if ($activeTriggers.length) {
                var lastActiveAccordion;
                lastActiveAccordion = $activeTriggers.eq($activeTriggers.length - 1).vcAccordion().data("vc.accordion"),
                lastActiveAccordion && lastActiveAccordion.getIndex && (activeIndex = lastActiveAccordion.getIndex())
            }
            activeIndex > -1 ? activeIndex - 1 >= 0 ? Plugin.call($triggers.eq(activeIndex - 1), "controller", opt) : Plugin.call($triggers.eq($triggers.length - 1), "controller", opt) : Plugin.call($triggers.eq(0), "controller", opt)
        }
    }
    Accordion.prototype.showAt = function(index, opt) {
        var $triggers;
        $triggers = this.getTriggers(),
        $triggers.length && index && index < $triggers.length && Plugin.call($triggers.eq(index), "controller", opt)
    }
    Accordion.prototype.scrollToActive = function(opt) {
        if ("undefined" == typeof opt || "undefined" == typeof opt.scrollTo || opt.scrollTo) {
            var that, $targetElement, offset, delay, speed;
            that = this,
            offset = 1,
            delay = 300,
            speed = 300,
            $targetElement = $(this.getTarget()),
            $targetElement.length && this.$element.length && setTimeout(function() {
                var posY = $targetElement.offset().top - $(window).scrollTop() - that.$element.outerHeight() * offset;
                0 > posY && $("html, body").animate({
                    scrollTop: $targetElement.offset().top - that.$element.outerHeight() * offset
                }, speed)
            }, delay)
        }
    }
    ,
    old = $.fn.vcAccordion,
    $.fn.vcAccordion = Plugin,
    $.fn.vcAccordion.Constructor = Accordion,
    $.fn.vcAccordion.noConflict = function() {
        return $.fn.vcAccordion = old,
        this
    }
    ,
    clickHandler = function(e) {
        var $this;
        $this = $(this),
        e.preventDefault(),
        Plugin.call($this, "controller")
    }
    ,
    hashNavigation = function() {
        var hash, $targetElement, $accordion, offset, delay, speed;
        offset = .2,
        delay = 300,
        speed = 0,
        hash = window.location.hash,
        hash && ($targetElement = $(hash),
        $targetElement.length && ($accordion = $targetElement.find('[data-vc-accordion][href="' + hash + '"],[data-vc-accordion][data-vc-target="' + hash + '"]'),
        $accordion.length && (setTimeout(function() {
            $("html, body").animate({
                scrollTop: $targetElement.offset().top - $(window).height() * offset
            }, speed)
        }, delay),
        $accordion.trigger("click"))))
    }
    ,
    $(window).on("hashchange.vc.accordion", hashNavigation),
    $(document).on("click.vc.accordion.data-api", "[data-vc-accordion]", clickHandler),
    $(document).on("ready.vc.accordion", hashNavigation),
    $(document).on("afterShow.vc.accordion", function(e, opt) {
        Plugin.call($(e.target), "scrollToActive", opt)
    })
}(window.jQuery);
;/*!
 * WPBakery Page Builder v6.0.0 (https://wpbakery.com)
 * Copyright 2011-2019 Michael M, WPBakery
 * License: Commercial. More details: http://go.wpbakery.com/licensing
 */

// jscs:disable
// jshint ignore: start

!function($) {
    "use strict";
    var Plugin, TtaAutoPlay, old;
    Plugin = function(action, options) {
        var args;
        return args = Array.prototype.slice.call(arguments, 1),
        this.each(function() {
            var $this, data;
            (data = ($this = $(this)).data("vc.tta.autoplay")) || (data = new TtaAutoPlay($this,$.extend(!0, {}, TtaAutoPlay.DEFAULTS, $this.data("vc-tta-autoplay"), options)),
            $this.data("vc.tta.autoplay", data)),
            "string" == typeof action ? data[action].apply(data, args) : data.start(args)
        })
    }
    ,
    (TtaAutoPlay = function($element, options) {
        this.$element = $element,
        this.options = options
    }
    ).DEFAULTS = {
        delay: 5e3,
        pauseOnHover: !0,
        stopOnClick: !0
    },
    TtaAutoPlay.prototype.show = function() {
        this.$element.find("[data-vc-accordion]:eq(0)").vcAccordion("showNext", {
            changeHash: !1,
            scrollTo: !1
        })
    }
    ,
    TtaAutoPlay.prototype.hasTimer = function() {
        return void 0 !== this.$element.data("vc.tta.autoplay.timer")
    }
    ,
    TtaAutoPlay.prototype.setTimer = function(windowInterval) {
        this.$element.data("vc.tta.autoplay.timer", windowInterval)
    }
    ,
    TtaAutoPlay.prototype.getTimer = function() {
        return this.$element.data("vc.tta.autoplay.timer")
    }
    ,
    TtaAutoPlay.prototype.deleteTimer = function() {
        this.$element.removeData("vc.tta.autoplay.timer")
    }
    ,
    TtaAutoPlay.prototype.start = function() {
        var $this, that;
        $this = this.$element,
        (that = this).hasTimer() || (this.setTimer(window.setInterval(this.show.bind(this), this.options.delay)),
        this.options.stopOnClick && $this.on("click.vc.tta.autoplay.data-api", "[data-vc-accordion]", function(e) {
            e && e.preventDefault && e.preventDefault(),
            that.hasTimer() && Plugin.call($this, "stop")
        }),
        this.options.pauseOnHover && $this.hover(function(e) {
            e && e.preventDefault && e.preventDefault(),
            that.hasTimer() && Plugin.call($this, "mouseleave" === e.type ? "resume" : "pause")
        }))
    }
    ,
    TtaAutoPlay.prototype.resume = function() {
        this.hasTimer() && this.setTimer(window.setInterval(this.show.bind(this), this.options.delay))
    }
    ,
    TtaAutoPlay.prototype.stop = function() {
        this.pause(),
        this.deleteTimer(),
        this.$element.off("click.vc.tta.autoplay.data-api mouseenter mouseleave")
    }
    ,
    TtaAutoPlay.prototype.pause = function() {
        var timer;
        void 0 !== (timer = this.getTimer()) && window.clearInterval(timer)
    }
    ,
    old = $.fn.vcTtaAutoPlay,
    $.fn.vcTtaAutoPlay = Plugin,
    $.fn.vcTtaAutoPlay.Constructor = TtaAutoPlay,
    $.fn.vcTtaAutoPlay.noConflict = function() {
        return $.fn.vcTtaAutoPlay = old,
        this
    }
    ,
    $(document).ready(function() {
        $("[data-vc-tta-autoplay]").each(function() {
            $(this).vcTtaAutoPlay()
        })
    })
}(window.jQuery);
;/*!
 * MediaElement.js
 * http://www.mediaelementjs.com/
 *
 * Wrapper that mimics native HTML5 MediaElement (audio and video)
 * using a variety of technologies (pure JavaScript, Flash, iframe)
 *
 * Copyright 2010-2017, John Dyer (http://j.hn/)
 * License: MIT
 *
 */
!function r(a, s, l) {
    function d(t, e) {
        if (!s[t]) {
            if (!a[t]) {
                var n = "function" == typeof require && require;
                if (!e && n)
                    return n(t, !0);
                if (u)
                    return u(t, !0);
                var o = new Error("Cannot find module '" + t + "'");
                throw o.code = "MODULE_NOT_FOUND",
                o
            }
            var i = s[t] = {
                exports: {}
            };
            a[t][0].call(i.exports, function(e) {
                return d(a[t][1][e] || e)
            }, i, i.exports, r, a, s, l)
        }
        return s[t].exports
    }
    for (var u = "function" == typeof require && require, e = 0; e < l.length; e++)
        d(l[e]);
    return d
}({
    1: [function(e, t, n) {}
    , {}],
    2: [function(i, r, e) {
        (function(e) {
            var t, n = void 0 !== e ? e : "undefined" != typeof window ? window : {}, o = i(1);
            "undefined" != typeof document ? t = document : (t = n["__GLOBAL_DOCUMENT_CACHE@4"]) || (t = n["__GLOBAL_DOCUMENT_CACHE@4"] = o),
            r.exports = t
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {
        1: 1
    }],
    3: [function(e, n, t) {
        (function(e) {
            var t;
            t = "undefined" != typeof window ? window : void 0 !== e ? e : "undefined" != typeof self ? self : {},
            n.exports = t
        }
        ).call(this, "undefined" != typeof global ? global : "undefined" != typeof self ? self : "undefined" != typeof window ? window : {})
    }
    , {}],
    4: [function(e, t, n) {
        var o, i, r = t.exports = {};
        function a() {
            throw new Error("setTimeout has not been defined")
        }
        function s() {
            throw new Error("clearTimeout has not been defined")
        }
        function l(t) {
            if (o === setTimeout)
                return setTimeout(t, 0);
            if ((o === a || !o) && setTimeout)
                return o = setTimeout,
                setTimeout(t, 0);
            try {
                return o(t, 0)
            } catch (e) {
                try {
                    return o.call(null, t, 0)
                } catch (e) {
                    return o.call(this, t, 0)
                }
            }
        }
        !function() {
            try {
                o = "function" == typeof setTimeout ? setTimeout : a
            } catch (e) {
                o = a
            }
            try {
                i = "function" == typeof clearTimeout ? clearTimeout : s
            } catch (e) {
                i = s
            }
        }();
        var d, u = [], c = !1, f = -1;
        function p() {
            c && d && (c = !1,
            d.length ? u = d.concat(u) : f = -1,
            u.length && m())
        }
        function m() {
            if (!c) {
                var e = l(p);
                c = !0;
                for (var t = u.length; t; ) {
                    for (d = u,
                    u = []; ++f < t; )
                        d && d[f].run();
                    f = -1,
                    t = u.length
                }
                d = null,
                c = !1,
                function(t) {
                    if (i === clearTimeout)
                        return clearTimeout(t);
                    if ((i === s || !i) && clearTimeout)
                        return i = clearTimeout,
                        clearTimeout(t);
                    try {
                        i(t)
                    } catch (e) {
                        try {
                            return i.call(null, t)
                        } catch (e) {
                            return i.call(this, t)
                        }
                    }
                }(e)
            }
        }
        function h(e, t) {
            this.fun = e,
            this.array = t
        }
        function v() {}
        r.nextTick = function(e) {
            var t = new Array(arguments.length - 1);
            if (1 < arguments.length)
                for (var n = 1; n < arguments.length; n++)
                    t[n - 1] = arguments[n];
            u.push(new h(e,t)),
            1 !== u.length || c || l(m)
        }
        ,
        h.prototype.run = function() {
            this.fun.apply(null, this.array)
        }
        ,
        r.title = "browser",
        r.browser = !0,
        r.env = {},
        r.argv = [],
        r.version = "",
        r.versions = {},
        r.on = v,
        r.addListener = v,
        r.once = v,
        r.off = v,
        r.removeListener = v,
        r.removeAllListeners = v,
        r.emit = v,
        r.prependListener = v,
        r.prependOnceListener = v,
        r.listeners = function(e) {
            return []
        }
        ,
        r.binding = function(e) {
            throw new Error("process.binding is not supported")
        }
        ,
        r.cwd = function() {
            return "/"
        }
        ,
        r.chdir = function(e) {
            throw new Error("process.chdir is not supported")
        }
        ,
        r.umask = function() {
            return 0
        }
    }
    , {}],
    5: [function(e, c, t) {
        (function(n) {
            !function(e) {
                var t = setTimeout;
                function o() {}
                function r(e) {
                    if ("object" != typeof this)
                        throw new TypeError("Promises must be constructed via new");
                    if ("function" != typeof e)
                        throw new TypeError("not a function");
                    this._state = 0,
                    this._handled = !1,
                    this._value = void 0,
                    this._deferreds = [],
                    u(e, this)
                }
                function i(n, o) {
                    for (; 3 === n._state; )
                        n = n._value;
                    0 !== n._state ? (n._handled = !0,
                    r._immediateFn(function() {
                        var e = 1 === n._state ? o.onFulfilled : o.onRejected;
                        if (null !== e) {
                            var t;
                            try {
                                t = e(n._value)
                            } catch (e) {
                                return void s(o.promise, e)
                            }
                            a(o.promise, t)
                        } else
                            (1 === n._state ? a : s)(o.promise, n._value)
                    })) : n._deferreds.push(o)
                }
                function a(t, e) {
                    try {
                        if (e === t)
                            throw new TypeError("A promise cannot be resolved with itself.");
                        if (e && ("object" == typeof e || "function" == typeof e)) {
                            var n = e.then;
                            if (e instanceof r)
                                return t._state = 3,
                                t._value = e,
                                void l(t);
                            if ("function" == typeof n)
                                return void u((o = n,
                                i = e,
                                function() {
                                    o.apply(i, arguments)
                                }
                                ), t)
                        }
                        t._state = 1,
                        t._value = e,
                        l(t)
                    } catch (e) {
                        s(t, e)
                    }
                    var o, i
                }
                function s(e, t) {
                    e._state = 2,
                    e._value = t,
                    l(e)
                }
                function l(e) {
                    2 === e._state && 0 === e._deferreds.length && r._immediateFn(function() {
                        e._handled || r._unhandledRejectionFn(e._value)
                    });
                    for (var t = 0, n = e._deferreds.length; t < n; t++)
                        i(e, e._deferreds[t]);
                    e._deferreds = null
                }
                function d(e, t, n) {
                    this.onFulfilled = "function" == typeof e ? e : null,
                    this.onRejected = "function" == typeof t ? t : null,
                    this.promise = n
                }
                function u(e, t) {
                    var n = !1;
                    try {
                        e(function(e) {
                            n || (n = !0,
                            a(t, e))
                        }, function(e) {
                            n || (n = !0,
                            s(t, e))
                        })
                    } catch (e) {
                        if (n)
                            return;
                        n = !0,
                        s(t, e)
                    }
                }
                r.prototype.catch = function(e) {
                    return this.then(null, e)
                }
                ,
                r.prototype.then = function(e, t) {
                    var n = new this.constructor(o);
                    return i(this, new d(e,t,n)),
                    n
                }
                ,
                r.all = function(e) {
                    var s = Array.prototype.slice.call(e);
                    return new r(function(o, i) {
                        if (0 === s.length)
                            return o([]);
                        var r = s.length;
                        function a(t, e) {
                            try {
                                if (e && ("object" == typeof e || "function" == typeof e)) {
                                    var n = e.then;
                                    if ("function" == typeof n)
                                        return void n.call(e, function(e) {
                                            a(t, e)
                                        }, i)
                                }
                                s[t] = e,
                                0 == --r && o(s)
                            } catch (e) {
                                i(e)
                            }
                        }
                        for (var e = 0; e < s.length; e++)
                            a(e, s[e])
                    }
                    )
                }
                ,
                r.resolve = function(t) {
                    return t && "object" == typeof t && t.constructor === r ? t : new r(function(e) {
                        e(t)
                    }
                    )
                }
                ,
                r.reject = function(n) {
                    return new r(function(e, t) {
                        t(n)
                    }
                    )
                }
                ,
                r.race = function(i) {
                    return new r(function(e, t) {
                        for (var n = 0, o = i.length; n < o; n++)
                            i[n].then(e, t)
                    }
                    )
                }
                ,
                r._immediateFn = "function" == typeof n && function(e) {
                    n(e)
                }
                || function(e) {
                    t(e, 0)
                }
                ,
                r._unhandledRejectionFn = function(e) {
                    "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", e)
                }
                ,
                r._setImmediateFn = function(e) {
                    r._immediateFn = e
                }
                ,
                r._setUnhandledRejectionFn = function(e) {
                    r._unhandledRejectionFn = e
                }
                ,
                void 0 !== c && c.exports ? c.exports = r : e.Promise || (e.Promise = r)
            }(this)
        }
        ).call(this, e(6).setImmediate)
    }
    , {
        6: 6
    }],
    6: [function(l, e, d) {
        (function(e, t) {
            var o = l(4).nextTick
              , n = Function.prototype.apply
              , i = Array.prototype.slice
              , r = {}
              , a = 0;
            function s(e, t) {
                this._id = e,
                this._clearFn = t
            }
            d.setTimeout = function() {
                return new s(n.call(setTimeout, window, arguments),clearTimeout)
            }
            ,
            d.setInterval = function() {
                return new s(n.call(setInterval, window, arguments),clearInterval)
            }
            ,
            d.clearTimeout = d.clearInterval = function(e) {
                e.close()
            }
            ,
            s.prototype.unref = s.prototype.ref = function() {}
            ,
            s.prototype.close = function() {
                this._clearFn.call(window, this._id)
            }
            ,
            d.enroll = function(e, t) {
                clearTimeout(e._idleTimeoutId),
                e._idleTimeout = t
            }
            ,
            d.unenroll = function(e) {
                clearTimeout(e._idleTimeoutId),
                e._idleTimeout = -1
            }
            ,
            d._unrefActive = d.active = function(e) {
                clearTimeout(e._idleTimeoutId);
                var t = e._idleTimeout;
                0 <= t && (e._idleTimeoutId = setTimeout(function() {
                    e._onTimeout && e._onTimeout()
                }, t))
            }
            ,
            d.setImmediate = "function" == typeof e ? e : function(e) {
                var t = a++
                  , n = !(arguments.length < 2) && i.call(arguments, 1);
                return r[t] = !0,
                o(function() {
                    r[t] && (n ? e.apply(null, n) : e.call(null),
                    d.clearImmediate(t))
                }),
                t
            }
            ,
            d.clearImmediate = "function" == typeof t ? t : function(e) {
                delete r[e]
            }
        }
        ).call(this, l(6).setImmediate, l(6).clearImmediate)
    }
    , {
        4: 4,
        6: 6
    }],
    7: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o, a = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        , i = e(9), r = (o = i) && o.__esModule ? o : {
            default: o
        }, s = e(17), l = e(29);
        var d = {
            lang: "en",
            en: s.EN,
            language: function() {
                for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
                    t[n] = arguments[n];
                if (null != t && t.length) {
                    if ("string" != typeof t[0])
                        throw new TypeError("Language code must be a string value");
                    if (!/^[a-z]{2,3}((\-|_)[a-z]{2})?$/i.test(t[0]))
                        throw new TypeError("Language code must have format 2-3 letters and. optionally, hyphen, underscore followed by 2 more letters");
                    d.lang = t[0],
                    void 0 === d[t[0]] ? (t[1] = null !== t[1] && void 0 !== t[1] && "object" === a(t[1]) ? t[1] : {},
                    d[t[0]] = (0,
                    l.isObjectEmpty)(t[1]) ? s.EN : t[1]) : null !== t[1] && void 0 !== t[1] && "object" === a(t[1]) && (d[t[0]] = t[1])
                }
                return d.lang
            },
            t: function(e) {
                var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : null;
                if ("string" == typeof e && e.length) {
                    var n = void 0
                      , o = void 0
                      , i = d.language()
                      , r = function(e, t, n) {
                        return "object" !== (void 0 === e ? "undefined" : a(e)) || "number" != typeof t || "number" != typeof n ? e : [function() {
                            return arguments.length <= 1 ? void 0 : arguments[1]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : arguments.length <= 2 ? void 0 : arguments[2]
                        }
                        , function() {
                            return 0 === (arguments.length <= 0 ? void 0 : arguments[0]) || 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : arguments.length <= 2 ? void 0 : arguments[2]
                        }
                        , function() {
                            return (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 1 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 != 11 ? arguments.length <= 1 ? void 0 : arguments[1] : 0 !== (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) || 11 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 === (arguments.length <= 0 ? void 0 : arguments[0]) || 12 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : 2 < (arguments.length <= 0 ? void 0 : arguments[0]) && (arguments.length <= 0 ? void 0 : arguments[0]) < 20 ? arguments.length <= 3 ? void 0 : arguments[3] : arguments.length <= 4 ? void 0 : arguments[4]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 0 === (arguments.length <= 0 ? void 0 : arguments[0]) || 0 < (arguments.length <= 0 ? void 0 : arguments[0]) % 100 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 20 ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 1 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 != 11 ? arguments.length <= 1 ? void 0 : arguments[1] : 2 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 10 && ((arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 10 || 20 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100) ? arguments.length <= 2 ? void 0 : arguments[2] : [3]
                        }
                        , function() {
                            return (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 1 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 != 11 ? arguments.length <= 1 ? void 0 : arguments[1] : 2 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 10 && (arguments.length <= 0 ? void 0 : arguments[0]) % 10 <= 4 && ((arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 10 || 20 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100) ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 <= (arguments.length <= 0 ? void 0 : arguments[0]) && (arguments.length <= 0 ? void 0 : arguments[0]) <= 4 ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 10 && (arguments.length <= 0 ? void 0 : arguments[0]) % 10 <= 4 && ((arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 10 || 20 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100) ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return (arguments.length <= 0 ? void 0 : arguments[0]) % 100 == 1 ? arguments.length <= 2 ? void 0 : arguments[2] : (arguments.length <= 0 ? void 0 : arguments[0]) % 100 == 2 ? arguments.length <= 3 ? void 0 : arguments[3] : (arguments.length <= 0 ? void 0 : arguments[0]) % 100 == 3 || (arguments.length <= 0 ? void 0 : arguments[0]) % 100 == 4 ? arguments.length <= 4 ? void 0 : arguments[4] : arguments.length <= 1 ? void 0 : arguments[1]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : 2 < (arguments.length <= 0 ? void 0 : arguments[0]) && (arguments.length <= 0 ? void 0 : arguments[0]) < 7 ? arguments.length <= 3 ? void 0 : arguments[3] : 6 < (arguments.length <= 0 ? void 0 : arguments[0]) && (arguments.length <= 0 ? void 0 : arguments[0]) < 11 ? arguments.length <= 4 ? void 0 : arguments[4] : arguments.length <= 5 ? void 0 : arguments[5]
                        }
                        , function() {
                            return 0 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : 2 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 3 ? void 0 : arguments[3] : 3 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 <= 10 ? arguments.length <= 4 ? void 0 : arguments[4] : 11 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100 ? arguments.length <= 5 ? void 0 : arguments[5] : arguments.length <= 6 ? void 0 : arguments[6]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 0 === (arguments.length <= 0 ? void 0 : arguments[0]) || 1 < (arguments.length <= 0 ? void 0 : arguments[0]) % 100 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 11 ? arguments.length <= 2 ? void 0 : arguments[2] : 10 < (arguments.length <= 0 ? void 0 : arguments[0]) % 100 && (arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 20 ? arguments.length <= 3 ? void 0 : arguments[3] : arguments.length <= 4 ? void 0 : arguments[4]
                        }
                        , function() {
                            return (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 1 ? arguments.length <= 1 ? void 0 : arguments[1] : (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 2 ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return 11 !== (arguments.length <= 0 ? void 0 : arguments[0]) && (arguments.length <= 0 ? void 0 : arguments[0]) % 10 == 1 ? arguments.length <= 1 ? void 0 : arguments[1] : arguments.length <= 2 ? void 0 : arguments[2]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 10 && (arguments.length <= 0 ? void 0 : arguments[0]) % 10 <= 4 && ((arguments.length <= 0 ? void 0 : arguments[0]) % 100 < 10 || 20 <= (arguments.length <= 0 ? void 0 : arguments[0]) % 100) ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : 8 !== (arguments.length <= 0 ? void 0 : arguments[0]) && 11 !== (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 3 ? void 0 : arguments[3] : arguments.length <= 4 ? void 0 : arguments[4]
                        }
                        , function() {
                            return 0 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : arguments.length <= 2 ? void 0 : arguments[2]
                        }
                        , function() {
                            return 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 2 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : 3 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 3 ? void 0 : arguments[3] : arguments.length <= 4 ? void 0 : arguments[4]
                        }
                        , function() {
                            return 0 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 1 ? void 0 : arguments[1] : 1 === (arguments.length <= 0 ? void 0 : arguments[0]) ? arguments.length <= 2 ? void 0 : arguments[2] : arguments.length <= 3 ? void 0 : arguments[3]
                        }
                        ][n].apply(null, [t].concat(e))
                    };
                    return void 0 !== d[i] && (n = d[i][e],
                    null !== t && "number" == typeof t && (o = d[i]["mejs.plural-form"],
                    n = r.apply(null, [n, t, o]))),
                    !n && d.en && (n = d.en[e],
                    null !== t && "number" == typeof t && (o = d.en["mejs.plural-form"],
                    n = r.apply(null, [n, t, o]))),
                    n = n || e,
                    null !== t && "number" == typeof t && (n = n.replace("%1", t)),
                    (0,
                    l.escapeHTML)(n)
                }
                return e
            }
        };
        r.default.i18n = d,
        "undefined" != typeof mejsL10n && r.default.i18n.language(mejsL10n.language, mejsL10n.strings),
        n.default = d
    }
    , {
        17: 17,
        29: 29,
        9: 9
    }],
    8: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var L = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , F = o(e(3))
          , I = o(e(2))
          , j = o(e(9))
          , M = e(29)
          , O = e(30)
          , D = e(10)
          , R = e(27);
        function o(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var i = function e(t, n, o) {
            var c = this;
            !function(e, t) {
                if (!(e instanceof t))
                    throw new TypeError("Cannot call a class as a function")
            }(this, e);
            var f = this;
            o = Array.isArray(o) ? o : null,
            f.defaults = {
                renderers: [],
                fakeNodeName: "mediaelementwrapper",
                pluginPath: "build/",
                shimScriptAccess: "sameDomain"
            },
            n = Object.assign(f.defaults, n),
            f.mediaElement = I.default.createElement(n.fakeNodeName);
            var i = t
              , r = !1;
            if ("string" == typeof t ? f.mediaElement.originalNode = I.default.getElementById(t) : i = (f.mediaElement.originalNode = t).id,
            void 0 === f.mediaElement.originalNode || null === f.mediaElement.originalNode)
                return null;
            f.mediaElement.options = n,
            i = i || "mejs_" + Math.random().toString().slice(2),
            f.mediaElement.originalNode.setAttribute("id", i + "_from_mejs");
            var a = f.mediaElement.originalNode.tagName.toLowerCase();
            -1 < ["video", "audio"].indexOf(a) && !f.mediaElement.originalNode.getAttribute("preload") && f.mediaElement.originalNode.setAttribute("preload", "none"),
            f.mediaElement.originalNode.parentNode.insertBefore(f.mediaElement, f.mediaElement.originalNode),
            f.mediaElement.appendChild(f.mediaElement.originalNode);
            var s = function(t, e) {
                if ("https:" === F.default.location.protocol && 0 === t.indexOf("http:") && R.IS_IOS && -1 < j.default.html5media.mediaTypes.indexOf(e)) {
                    var n = new XMLHttpRequest;
                    n.onreadystatechange = function() {
                        if (4 !== this.readyState || 200 !== this.status)
                            return t;
                        var e = (F.default.URL || F.default.webkitURL).createObjectURL(this.response);
                        return f.mediaElement.originalNode.setAttribute("src", e),
                        e
                    }
                    ,
                    n.open("GET", t),
                    n.responseType = "blob",
                    n.send()
                }
                return t
            }
              , l = void 0;
            if (null !== o)
                l = o;
            else if (null !== f.mediaElement.originalNode)
                switch (l = [],
                f.mediaElement.originalNode.nodeName.toLowerCase()) {
                case "iframe":
                    l.push({
                        type: "",
                        src: f.mediaElement.originalNode.getAttribute("src")
                    });
                    break;
                case "audio":
                case "video":
                    var d = f.mediaElement.originalNode.children.length
                      , u = f.mediaElement.originalNode.getAttribute("src");
                    if (u) {
                        var p = f.mediaElement.originalNode
                          , m = (0,
                        O.formatType)(u, p.getAttribute("type"));
                        l.push({
                            type: m,
                            src: s(u, m)
                        })
                    }
                    for (var h = 0; h < d; h++) {
                        var v = f.mediaElement.originalNode.children[h];
                        if ("source" === v.tagName.toLowerCase()) {
                            var y = v.getAttribute("src")
                              , g = (0,
                            O.formatType)(y, v.getAttribute("type"));
                            l.push({
                                type: g,
                                src: s(y, g)
                            })
                        }
                    }
                }
            f.mediaElement.id = i,
            f.mediaElement.renderers = {},
            f.mediaElement.events = {},
            f.mediaElement.promises = [],
            f.mediaElement.renderer = null,
            f.mediaElement.rendererName = null,
            f.mediaElement.changeRenderer = function(e, t) {
                var n = c
                  , o = 2 < Object.keys(t[0]).length ? t[0] : t[0].src;
                if (void 0 !== n.mediaElement.renderer && null !== n.mediaElement.renderer && n.mediaElement.renderer.name === e)
                    return n.mediaElement.renderer.pause(),
                    n.mediaElement.renderer.stop && n.mediaElement.renderer.stop(),
                    n.mediaElement.renderer.show(),
                    n.mediaElement.renderer.setSrc(o),
                    !0;
                void 0 !== n.mediaElement.renderer && null !== n.mediaElement.renderer && (n.mediaElement.renderer.pause(),
                n.mediaElement.renderer.stop && n.mediaElement.renderer.stop(),
                n.mediaElement.renderer.hide());
                var i = n.mediaElement.renderers[e]
                  , r = null;
                if (null != i)
                    return i.show(),
                    i.setSrc(o),
                    n.mediaElement.renderer = i,
                    n.mediaElement.rendererName = e,
                    !0;
                for (var a = n.mediaElement.options.renderers.length ? n.mediaElement.options.renderers : D.renderer.order, s = 0, l = a.length; s < l; s++) {
                    var d = a[s];
                    if (d === e) {
                        r = D.renderer.renderers[d];
                        var u = Object.assign(r.options, n.mediaElement.options);
                        return (i = r.create(n.mediaElement, u, t)).name = e,
                        n.mediaElement.renderers[r.name] = i,
                        n.mediaElement.renderer = i,
                        n.mediaElement.rendererName = e,
                        i.show(),
                        !0
                    }
                }
                return !1
            }
            ,
            f.mediaElement.setSize = function(e, t) {
                void 0 !== f.mediaElement.renderer && null !== f.mediaElement.renderer && f.mediaElement.renderer.setSize(e, t)
            }
            ,
            f.mediaElement.generateError = function(e, t) {
                e = e || "",
                t = Array.isArray(t) ? t : [];
                var n = (0,
                M.createEvent)("error", f.mediaElement);
                n.message = e,
                n.urls = t,
                f.mediaElement.dispatchEvent(n),
                r = !0
            }
            ;
            var E = j.default.html5media.properties
              , b = j.default.html5media.methods
              , S = function(t, e, n, o) {
                var i = t[e];
                Object.defineProperty(t, e, {
                    get: function() {
                        return n.apply(t, [i])
                    },
                    set: function(e) {
                        return i = o.apply(t, [e])
                    }
                })
            }
              , w = function(e) {
                if ("src" !== e) {
                    var t = "" + e.substring(0, 1).toUpperCase() + e.substring(1)
                      , n = function() {
                        return void 0 !== f.mediaElement.renderer && null !== f.mediaElement.renderer && "function" == typeof f.mediaElement.renderer["get" + t] ? f.mediaElement.renderer["get" + t]() : null
                    }
                      , o = function(e) {
                        void 0 !== f.mediaElement.renderer && null !== f.mediaElement.renderer && "function" == typeof f.mediaElement.renderer["set" + t] && f.mediaElement.renderer["set" + t](e)
                    };
                    S(f.mediaElement, e, n, o),
                    f.mediaElement["get" + t] = n,
                    f.mediaElement["set" + t] = o
                }
            }
              , x = function() {
                return void 0 !== f.mediaElement.renderer && null !== f.mediaElement.renderer ? f.mediaElement.renderer.getSrc() : null
            }
              , T = function(e) {
                var t = [];
                if ("string" == typeof e)
                    t.push({
                        src: e,
                        type: e ? (0,
                        O.getTypeFromFile)(e) : ""
                    });
                else if ("object" === (void 0 === e ? "undefined" : L(e)) && void 0 !== e.src) {
                    var n = (0,
                    O.absolutizeUrl)(e.src)
                      , o = e.type
                      , i = Object.assign(e, {
                        src: n,
                        type: "" !== o && null != o || !n ? o : (0,
                        O.getTypeFromFile)(n)
                    });
                    t.push(i)
                } else if (Array.isArray(e))
                    for (var r = 0, a = e.length; r < a; r++) {
                        var s = (0,
                        O.absolutizeUrl)(e[r].src)
                          , l = e[r].type
                          , d = Object.assign(e[r], {
                            src: s,
                            type: "" !== l && null != l || !s ? l : (0,
                            O.getTypeFromFile)(s)
                        });
                        t.push(d)
                    }
                var u = D.renderer.select(t, f.mediaElement.options.renderers.length ? f.mediaElement.options.renderers : [])
                  , c = void 0;
                if (f.mediaElement.paused || (f.mediaElement.pause(),
                c = (0,
                M.createEvent)("pause", f.mediaElement),
                f.mediaElement.dispatchEvent(c)),
                f.mediaElement.originalNode.src = t[0].src || "",
                null !== u || !t[0].src)
                    return t[0].src ? f.mediaElement.changeRenderer(u.rendererName, t) : null;
                f.mediaElement.generateError("No renderer found", t)
            }
              , P = function(e, t) {
                try {
                    if ("play" !== e || "native_dash" !== f.mediaElement.rendererName && "native_hls" !== f.mediaElement.rendererName)
                        f.mediaElement.renderer[e](t);
                    else {
                        var n = f.mediaElement.renderer[e](t);
                        n && "function" == typeof n.then && n.catch(function() {
                            f.mediaElement.paused && setTimeout(function() {
                                var e = f.mediaElement.renderer.play();
                                void 0 !== e && e.catch(function() {
                                    f.mediaElement.renderer.paused || f.mediaElement.renderer.pause()
                                })
                            }, 150)
                        })
                    }
                } catch (e) {
                    f.mediaElement.generateError(e, l)
                }
            }
              , C = function(o) {
                f.mediaElement[o] = function() {
                    for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
                        t[n] = arguments[n];
                    return void 0 !== f.mediaElement.renderer && null !== f.mediaElement.renderer && "function" == typeof f.mediaElement.renderer[o] && (f.mediaElement.promises.length ? Promise.all(f.mediaElement.promises).then(function() {
                        P(o, t)
                    }).catch(function(e) {
                        f.mediaElement.generateError(e, l)
                    }) : P(o, t)),
                    null
                }
            };
            S(f.mediaElement, "src", x, T),
            f.mediaElement.getSrc = x,
            f.mediaElement.setSrc = T;
            for (var k = 0, _ = E.length; k < _; k++)
                w(E[k]);
            for (var N = 0, A = b.length; N < A; N++)
                C(b[N]);
            return f.mediaElement.addEventListener = function(e, t) {
                f.mediaElement.events[e] = f.mediaElement.events[e] || [],
                f.mediaElement.events[e].push(t)
            }
            ,
            f.mediaElement.removeEventListener = function(e, t) {
                if (!e)
                    return f.mediaElement.events = {},
                    !0;
                var n = f.mediaElement.events[e];
                if (!n)
                    return !0;
                if (!t)
                    return f.mediaElement.events[e] = [],
                    !0;
                for (var o = 0; o < n.length; o++)
                    if (n[o] === t)
                        return f.mediaElement.events[e].splice(o, 1),
                        !0;
                return !1
            }
            ,
            f.mediaElement.dispatchEvent = function(e) {
                var t = f.mediaElement.events[e.type];
                if (t)
                    for (var n = 0; n < t.length; n++)
                        t[n].apply(null, [e])
            }
            ,
            f.mediaElement.destroy = function() {
                var e = f.mediaElement.originalNode.cloneNode(!0)
                  , t = f.mediaElement.parentElement;
                e.removeAttribute("id"),
                e.remove(),
                f.mediaElement.remove(),
                t.appendChild(e)
            }
            ,
            l.length && (f.mediaElement.src = l),
            f.mediaElement.promises.length ? Promise.all(f.mediaElement.promises).then(function() {
                f.mediaElement.options.success && f.mediaElement.options.success(f.mediaElement, f.mediaElement.originalNode)
            }).catch(function() {
                r && f.mediaElement.options.error && f.mediaElement.options.error(f.mediaElement, f.mediaElement.originalNode)
            }) : (f.mediaElement.options.success && f.mediaElement.options.success(f.mediaElement, f.mediaElement.originalNode),
            r && f.mediaElement.options.error && f.mediaElement.options.error(f.mediaElement, f.mediaElement.originalNode)),
            f.mediaElement
        };
        F.default.MediaElement = i,
        j.default.MediaElement = i,
        n.default = i
    }
    , {
        10: 10,
        2: 2,
        27: 27,
        29: 29,
        3: 3,
        30: 30,
        9: 9
    }],
    9: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o, i = e(3);
        var r = {
            version: "4.2.12",
            html5media: {
                properties: ["volume", "src", "currentTime", "muted", "duration", "paused", "ended", "buffered", "error", "networkState", "readyState", "seeking", "seekable", "currentSrc", "preload", "bufferedBytes", "bufferedTime", "initialTime", "startOffsetTime", "defaultPlaybackRate", "playbackRate", "played", "autoplay", "loop", "controls"],
                readOnlyProperties: ["duration", "paused", "ended", "buffered", "error", "networkState", "readyState", "seeking", "seekable"],
                methods: ["load", "play", "pause", "canPlayType"],
                events: ["loadstart", "durationchange", "loadedmetadata", "loadeddata", "progress", "canplay", "canplaythrough", "suspend", "abort", "error", "emptied", "stalled", "play", "playing", "pause", "waiting", "seeking", "seeked", "timeupdate", "ended", "ratechange", "volumechange"],
                mediaTypes: ["audio/mp3", "audio/ogg", "audio/oga", "audio/wav", "audio/x-wav", "audio/wave", "audio/x-pn-wav", "audio/mpeg", "audio/mp4", "video/mp4", "video/webm", "video/ogg", "video/ogv"]
            }
        };
        ((o = i) && o.__esModule ? o : {
            default: o
        }).default.mejs = r,
        n.default = r
    }
    , {
        3: 3
    }],
    10: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.renderer = void 0;
        var o, i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
        , r = function() {
            function o(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var o = t[n];
                    o.enumerable = o.enumerable || !1,
                    o.configurable = !0,
                    "value"in o && (o.writable = !0),
                    Object.defineProperty(e, o.key, o)
                }
            }
            return function(e, t, n) {
                return t && o(e.prototype, t),
                n && o(e, n),
                e
            }
        }(), a = e(9), s = (o = a) && o.__esModule ? o : {
            default: o
        };
        var l = function() {
            function e() {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                this.renderers = {},
                this.order = []
            }
            return r(e, [{
                key: "add",
                value: function(e) {
                    if (void 0 === e.name)
                        throw new TypeError("renderer must contain at least `name` property");
                    this.renderers[e.name] = e,
                    this.order.push(e.name)
                }
            }, {
                key: "select",
                value: function(e) {
                    var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : []
                      , n = t.length;
                    if (t = t.length ? t : this.order,
                    !n) {
                        var o = [/^(html5|native)/i, /^flash/i, /iframe$/i]
                          , i = function(e) {
                            for (var t = 0, n = o.length; t < n; t++)
                                if (o[t].test(e))
                                    return t;
                            return o.length
                        };
                        t.sort(function(e, t) {
                            return i(e) - i(t)
                        })
                    }
                    for (var r = 0, a = t.length; r < a; r++) {
                        var s = t[r]
                          , l = this.renderers[s];
                        if (null != l)
                            for (var d = 0, u = e.length; d < u; d++)
                                if ("function" == typeof l.canPlayType && "string" == typeof e[d].type && l.canPlayType(e[d].type))
                                    return {
                                        rendererName: l.name,
                                        src: e[d].src
                                    }
                    }
                    return null
                }
            }, {
                key: "order",
                set: function(e) {
                    if (!Array.isArray(e))
                        throw new TypeError("order must be an array of strings.");
                    this._order = e
                },
                get: function() {
                    return this._order
                }
            }, {
                key: "renderers",
                set: function(e) {
                    if (null !== e && "object" !== (void 0 === e ? "undefined" : i(e)))
                        throw new TypeError("renderers must be an array of objects.");
                    this._renderers = e
                },
                get: function() {
                    return this._renderers
                }
            }]),
            e
        }()
          , d = n.renderer = new l;
        s.default.Renderers = d
    }
    , {
        9: 9
    }],
    11: [function(e, t, n) {
        "use strict";
        var f = a(e(3))
          , p = a(e(2))
          , i = a(e(7))
          , o = e(18)
          , r = a(o)
          , m = function(e) {
            {
                if (e && e.__esModule)
                    return e;
                var t = {};
                if (null != e)
                    for (var n in e)
                        Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                return t.default = e,
                t
            }
        }(e(27))
          , h = e(29)
          , v = e(28)
          , y = e(30);
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(o.config, {
            usePluginFullScreen: !0,
            fullscreenText: null,
            useFakeFullscreen: !1
        }),
        Object.assign(r.default.prototype, {
            isFullScreen: !1,
            isNativeFullScreen: !1,
            isInIframe: !1,
            isPluginClickThroughCreated: !1,
            fullscreenMode: "",
            containerSizeTimeout: null,
            buildfullscreen: function(n) {
                if (n.isVideo) {
                    n.isInIframe = f.default.location !== f.default.parent.location,
                    n.detectFullscreenMode();
                    var o = this
                      , e = (0,
                    h.isString)(o.options.fullscreenText) ? o.options.fullscreenText : i.default.t("mejs.fullscreen")
                      , t = p.default.createElement("div");
                    if (t.className = o.options.classPrefix + "button " + o.options.classPrefix + "fullscreen-button",
                    t.innerHTML = '<button type="button" aria-controls="' + o.id + '" title="' + e + '" aria-label="' + e + '" tabindex="0"></button>',
                    o.addControlElement(t, "fullscreen"),
                    t.addEventListener("click", function() {
                        m.HAS_TRUE_NATIVE_FULLSCREEN && m.IS_FULLSCREEN || n.isFullScreen ? n.exitFullScreen() : n.enterFullScreen()
                    }),
                    n.fullscreenBtn = t,
                    o.options.keyActions.push({
                        keys: [70],
                        action: function(e, t, n, o) {
                            o.ctrlKey || void 0 !== e.enterFullScreen && (e.isFullScreen ? e.exitFullScreen() : e.enterFullScreen())
                        }
                    }),
                    o.exitFullscreenCallback = function(e) {
                        var t = e.which || e.keyCode || 0;
                        o.options.enableKeyboard && 27 === t && (m.HAS_TRUE_NATIVE_FULLSCREEN && m.IS_FULLSCREEN || o.isFullScreen) && n.exitFullScreen()
                    }
                    ,
                    o.globalBind("keydown", o.exitFullscreenCallback),
                    o.normalHeight = 0,
                    o.normalWidth = 0,
                    m.HAS_TRUE_NATIVE_FULLSCREEN) {
                        n.globalBind(m.FULLSCREEN_EVENT_NAME, function() {
                            n.isFullScreen && (m.isFullScreen() ? (n.isNativeFullScreen = !0,
                            n.setControlsSize()) : (n.isNativeFullScreen = !1,
                            n.exitFullScreen()))
                        })
                    }
                }
            },
            cleanfullscreen: function(e) {
                e.exitFullScreen(),
                e.globalUnbind("keydown", e.exitFullscreenCallback)
            },
            detectFullscreenMode: function() {
                var e = null !== this.media.rendererName && /(native|html5)/i.test(this.media.rendererName)
                  , t = "";
                return m.HAS_TRUE_NATIVE_FULLSCREEN && e ? t = "native-native" : m.HAS_TRUE_NATIVE_FULLSCREEN && !e ? t = "plugin-native" : this.usePluginFullScreen && m.SUPPORT_POINTER_EVENTS && (t = "plugin-click"),
                this.fullscreenMode = t
            },
            enterFullScreen: function() {
                var o = this
                  , e = null !== o.media.rendererName && /(html5|native)/i.test(o.media.rendererName)
                  , t = getComputedStyle(o.getElement(o.container));
                if (o.isVideo)
                    if (!1 === o.options.useFakeFullscreen && m.IS_IOS && m.HAS_IOS_FULLSCREEN && "function" == typeof o.media.originalNode.webkitEnterFullscreen && o.media.originalNode.canPlayType((0,
                    y.getTypeFromFile)(o.media.getSrc())))
                        o.media.originalNode.webkitEnterFullscreen();
                    else {
                        if ((0,
                        v.addClass)(p.default.documentElement, o.options.classPrefix + "fullscreen"),
                        (0,
                        v.addClass)(o.getElement(o.container), o.options.classPrefix + "container-fullscreen"),
                        o.normalHeight = parseFloat(t.height),
                        o.normalWidth = parseFloat(t.width),
                        "native-native" !== o.fullscreenMode && "plugin-native" !== o.fullscreenMode || (m.requestFullScreen(o.getElement(o.container)),
                        o.isInIframe && setTimeout(function e() {
                            if (o.isNativeFullScreen) {
                                var t = f.default.innerWidth || p.default.documentElement.clientWidth || p.default.body.clientWidth
                                  , n = screen.width;
                                .002 * n < Math.abs(n - t) ? o.exitFullScreen() : setTimeout(e, 500)
                            }
                        }, 1e3)),
                        o.getElement(o.container).style.width = "100%",
                        o.getElement(o.container).style.height = "100%",
                        o.containerSizeTimeout = setTimeout(function() {
                            o.getElement(o.container).style.width = "100%",
                            o.getElement(o.container).style.height = "100%",
                            o.setControlsSize()
                        }, 500),
                        e)
                            o.node.style.width = "100%",
                            o.node.style.height = "100%";
                        else
                            for (var n = o.getElement(o.container).querySelectorAll("embed, object, video"), i = n.length, r = 0; r < i; r++)
                                n[r].style.width = "100%",
                                n[r].style.height = "100%";
                        o.options.setDimensions && "function" == typeof o.media.setSize && o.media.setSize(screen.width, screen.height);
                        for (var a = o.getElement(o.layers).children, s = a.length, l = 0; l < s; l++)
                            a[l].style.width = "100%",
                            a[l].style.height = "100%";
                        o.fullscreenBtn && ((0,
                        v.removeClass)(o.fullscreenBtn, o.options.classPrefix + "fullscreen"),
                        (0,
                        v.addClass)(o.fullscreenBtn, o.options.classPrefix + "unfullscreen")),
                        o.setControlsSize(),
                        o.isFullScreen = !0;
                        var d = Math.min(screen.width / o.width, screen.height / o.height)
                          , u = o.getElement(o.container).querySelector("." + o.options.classPrefix + "captions-text");
                        u && (u.style.fontSize = 100 * d + "%",
                        u.style.lineHeight = "normal",
                        o.getElement(o.container).querySelector("." + o.options.classPrefix + "captions-position").style.bottom = (screen.height - o.normalHeight) / 2 - o.getElement(o.controls).offsetHeight / 2 + d + 15 + "px");
                        var c = (0,
                        h.createEvent)("enteredfullscreen", o.getElement(o.container));
                        o.getElement(o.container).dispatchEvent(c)
                    }
            },
            exitFullScreen: function() {
                var e = this
                  , t = null !== e.media.rendererName && /(native|html5)/i.test(e.media.rendererName);
                if (e.isVideo) {
                    if (clearTimeout(e.containerSizeTimeout),
                    m.HAS_TRUE_NATIVE_FULLSCREEN && (m.IS_FULLSCREEN || e.isFullScreen) && m.cancelFullScreen(),
                    (0,
                    v.removeClass)(p.default.documentElement, e.options.classPrefix + "fullscreen"),
                    (0,
                    v.removeClass)(e.getElement(e.container), e.options.classPrefix + "container-fullscreen"),
                    e.options.setDimensions) {
                        if (e.getElement(e.container).style.width = e.normalWidth + "px",
                        e.getElement(e.container).style.height = e.normalHeight + "px",
                        t)
                            e.node.style.width = e.normalWidth + "px",
                            e.node.style.height = e.normalHeight + "px";
                        else
                            for (var n = e.getElement(e.container).querySelectorAll("embed, object, video"), o = n.length, i = 0; i < o; i++)
                                n[i].style.width = e.normalWidth + "px",
                                n[i].style.height = e.normalHeight + "px";
                        "function" == typeof e.media.setSize && e.media.setSize(e.normalWidth, e.normalHeight);
                        for (var r = e.getElement(e.layers).children, a = r.length, s = 0; s < a; s++)
                            r[s].style.width = e.normalWidth + "px",
                            r[s].style.height = e.normalHeight + "px"
                    }
                    e.fullscreenBtn && ((0,
                    v.removeClass)(e.fullscreenBtn, e.options.classPrefix + "unfullscreen"),
                    (0,
                    v.addClass)(e.fullscreenBtn, e.options.classPrefix + "fullscreen")),
                    e.setControlsSize(),
                    e.isFullScreen = !1;
                    var l = e.getElement(e.container).querySelector("." + e.options.classPrefix + "captions-text");
                    l && (l.style.fontSize = "",
                    l.style.lineHeight = "",
                    e.getElement(e.container).querySelector("." + e.options.classPrefix + "captions-position").style.bottom = "");
                    var d = (0,
                    h.createEvent)("exitedfullscreen", e.getElement(e.container));
                    e.getElement(e.container).dispatchEvent(d)
                }
            }
        })
    }
    , {
        18: 18,
        2: 2,
        27: 27,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        7: 7
    }],
    12: [function(e, t, n) {
        "use strict";
        var c = r(e(2))
          , o = e(18)
          , i = r(o)
          , f = r(e(7))
          , p = e(29)
          , m = e(28);
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(o.config, {
            playText: null,
            pauseText: null
        }),
        Object.assign(i.default.prototype, {
            buildplaypause: function(e, t, n, o) {
                var i = this
                  , r = i.options
                  , a = (0,
                p.isString)(r.playText) ? r.playText : f.default.t("mejs.play")
                  , s = (0,
                p.isString)(r.pauseText) ? r.pauseText : f.default.t("mejs.pause")
                  , l = c.default.createElement("div");
                l.className = i.options.classPrefix + "button " + i.options.classPrefix + "playpause-button " + i.options.classPrefix + "play",
                l.innerHTML = '<button type="button" aria-controls="' + i.id + '" title="' + a + '" aria-label="' + s + '" tabindex="0"></button>',
                l.addEventListener("click", function() {
                    i.paused ? i.play() : i.pause()
                });
                var d = l.querySelector("button");
                function u(e) {
                    "play" === e ? ((0,
                    m.removeClass)(l, i.options.classPrefix + "play"),
                    (0,
                    m.removeClass)(l, i.options.classPrefix + "replay"),
                    (0,
                    m.addClass)(l, i.options.classPrefix + "pause"),
                    d.setAttribute("title", s),
                    d.setAttribute("aria-label", s)) : ((0,
                    m.removeClass)(l, i.options.classPrefix + "pause"),
                    (0,
                    m.removeClass)(l, i.options.classPrefix + "replay"),
                    (0,
                    m.addClass)(l, i.options.classPrefix + "play"),
                    d.setAttribute("title", a),
                    d.setAttribute("aria-label", a))
                }
                i.addControlElement(l, "playpause"),
                u("pse"),
                o.addEventListener("loadedmetadata", function() {
                    -1 === o.rendererName.indexOf("flash") && u("pse")
                }),
                o.addEventListener("play", function() {
                    u("play")
                }),
                o.addEventListener("playing", function() {
                    u("play")
                }),
                o.addEventListener("pause", function() {
                    u("pse")
                }),
                o.addEventListener("ended", function() {
                    e.options.loop || ((0,
                    m.removeClass)(l, i.options.classPrefix + "pause"),
                    (0,
                    m.removeClass)(l, i.options.classPrefix + "play"),
                    (0,
                    m.addClass)(l, i.options.classPrefix + "replay"),
                    d.setAttribute("title", a),
                    d.setAttribute("aria-label", a))
                })
            }
        })
    }
    , {
        18: 18,
        2: 2,
        28: 28,
        29: 29,
        7: 7
    }],
    13: [function(e, t, n) {
        "use strict";
        var p = r(e(2))
          , o = e(18)
          , i = r(o)
          , m = r(e(7))
          , g = e(27)
          , E = e(32)
          , b = e(28);
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(o.config, {
            enableProgressTooltip: !0,
            useSmoothHover: !0,
            forceLive: !1
        }),
        Object.assign(i.default.prototype, {
            buildprogress: function(h, s, e, d) {
                var u = 0
                  , v = !1
                  , c = !1
                  , y = this
                  , t = h.options.autoRewind
                  , n = h.options.enableProgressTooltip ? '<span class="' + y.options.classPrefix + 'time-float"><span class="' + y.options.classPrefix + 'time-float-current">00:00</span><span class="' + y.options.classPrefix + 'time-float-corner"></span></span>' : ""
                  , o = p.default.createElement("div");
                o.className = y.options.classPrefix + "time-rail",
                o.innerHTML = '<span class="' + y.options.classPrefix + "time-total " + y.options.classPrefix + 'time-slider"><span class="' + y.options.classPrefix + 'time-buffering"></span><span class="' + y.options.classPrefix + 'time-loaded"></span><span class="' + y.options.classPrefix + 'time-current"></span><span class="' + y.options.classPrefix + 'time-hovered no-hover"></span><span class="' + y.options.classPrefix + 'time-handle"><span class="' + y.options.classPrefix + 'time-handle-content"></span></span>' + n + "</span>",
                y.addControlElement(o, "progress"),
                y.options.keyActions.push({
                    keys: [37, 227],
                    action: function(e) {
                        if (!isNaN(e.duration) && 0 < e.duration) {
                            e.isVideo && (e.showControls(),
                            e.startControlsTimer());
                            var t = e.getElement(e.container).querySelector("." + _player.config.classPrefix + "time-total");
                            t && t.focus();
                            var n = Math.max(e.currentTime - e.options.defaultSeekBackwardInterval(e), 0);
                            e.setCurrentTime(n)
                        }
                    }
                }, {
                    keys: [39, 228],
                    action: function(e) {
                        if (!isNaN(e.duration) && 0 < e.duration) {
                            e.isVideo && (e.showControls(),
                            e.startControlsTimer());
                            var t = e.getElement(e.container).querySelector("." + _player.config.classPrefix + "time-total");
                            t && t.focus();
                            var n = Math.min(e.currentTime + e.options.defaultSeekForwardInterval(e), e.duration);
                            e.setCurrentTime(n)
                        }
                    }
                }),
                y.rail = s.querySelector("." + y.options.classPrefix + "time-rail"),
                y.total = s.querySelector("." + y.options.classPrefix + "time-total"),
                y.loaded = s.querySelector("." + y.options.classPrefix + "time-loaded"),
                y.current = s.querySelector("." + y.options.classPrefix + "time-current"),
                y.handle = s.querySelector("." + y.options.classPrefix + "time-handle"),
                y.timefloat = s.querySelector("." + y.options.classPrefix + "time-float"),
                y.timefloatcurrent = s.querySelector("." + y.options.classPrefix + "time-float-current"),
                y.slider = s.querySelector("." + y.options.classPrefix + "time-slider"),
                y.hovered = s.querySelector("." + y.options.classPrefix + "time-hovered"),
                y.buffer = s.querySelector("." + y.options.classPrefix + "time-buffering"),
                y.newTime = 0,
                y.forcedHandlePause = !1,
                y.setTransformStyle = function(e, t) {
                    e.style.transform = t,
                    e.style.webkitTransform = t,
                    e.style.MozTransform = t,
                    e.style.msTransform = t,
                    e.style.OTransform = t
                }
                ,
                y.buffer.style.display = "none";
                var i = function(e) {
                    var t = getComputedStyle(y.total)
                      , n = (0,
                    b.offset)(y.total)
                      , o = y.total.offsetWidth
                      , i = void 0 !== t.webkitTransform ? "webkitTransform" : void 0 !== t.mozTransform ? "mozTransform " : void 0 !== t.oTransform ? "oTransform" : void 0 !== t.msTransform ? "msTransform" : "transform"
                      , r = "WebKitCSSMatrix"in window ? "WebKitCSSMatrix" : "MSCSSMatrix"in window ? "MSCSSMatrix" : "CSSMatrix"in window ? "CSSMatrix" : void 0
                      , a = 0
                      , s = 0
                      , l = 0
                      , d = void 0;
                    if (d = e.originalEvent && e.originalEvent.changedTouches ? e.originalEvent.changedTouches[0].pageX : e.changedTouches ? e.changedTouches[0].pageX : e.pageX,
                    y.getDuration()) {
                        if (d < n.left ? d = n.left : d > o + n.left && (d = o + n.left),
                        a = (l = d - n.left) / o,
                        y.newTime = a * y.getDuration(),
                        v && null !== y.getCurrentTime() && y.newTime.toFixed(4) !== y.getCurrentTime().toFixed(4) && (y.setCurrentRailHandle(y.newTime),
                        y.updateCurrent(y.newTime)),
                        !g.IS_IOS && !g.IS_ANDROID) {
                            if (l < 0 && (l = 0),
                            y.options.useSmoothHover && null !== r && void 0 !== window[r]) {
                                var u = new window[r](getComputedStyle(y.handle)[i]).m41
                                  , c = l / parseFloat(getComputedStyle(y.total).width) - u / parseFloat(getComputedStyle(y.total).width);
                                y.hovered.style.left = u + "px",
                                y.setTransformStyle(y.hovered, "scaleX(" + c + ")"),
                                y.hovered.setAttribute("pos", l),
                                0 <= c ? (0,
                                b.removeClass)(y.hovered, "negative") : (0,
                                b.addClass)(y.hovered, "negative")
                            }
                            if (y.timefloat) {
                                var f = y.timefloat.offsetWidth / 2
                                  , p = mejs.Utils.offset(y.getElement(y.container))
                                  , m = getComputedStyle(y.timefloat);
                                s = d - p.left < y.timefloat.offsetWidth ? f : d - p.left >= y.getElement(y.container).offsetWidth - f ? y.total.offsetWidth - f : l,
                                (0,
                                b.hasClass)(y.getElement(y.container), y.options.classPrefix + "long-video") && (s += parseFloat(m.marginLeft) / 2 + y.timefloat.offsetWidth / 2),
                                y.timefloat.style.left = s + "px",
                                y.timefloatcurrent.innerHTML = (0,
                                E.secondsToTimeCode)(y.newTime, h.options.alwaysShowHours, h.options.showTimecodeFrameCount, h.options.framesPerSecond, h.options.secondsDecimalLength, h.options.timeFormat),
                                y.timefloat.style.display = "block"
                            }
                        }
                    } else
                        g.IS_IOS || g.IS_ANDROID || !y.timefloat || (s = y.timefloat.offsetWidth + o >= y.getElement(y.container).offsetWidth ? y.timefloat.offsetWidth / 2 : 0,
                        y.timefloat.style.left = s + "px",
                        y.timefloat.style.left = s + "px",
                        y.timefloat.style.display = "block")
                }
                  , f = function() {
                    1e3 <= new Date - u && y.play()
                };
                y.slider.addEventListener("focus", function() {
                    h.options.autoRewind = !1
                }),
                y.slider.addEventListener("blur", function() {
                    h.options.autoRewind = t
                }),
                y.slider.addEventListener("keydown", function(e) {
                    if (1e3 <= new Date - u && (c = y.paused),
                    y.options.enableKeyboard && y.options.keyActions.length) {
                        var t = e.which || e.keyCode || 0
                          , n = y.getDuration()
                          , o = h.options.defaultSeekForwardInterval(d)
                          , i = h.options.defaultSeekBackwardInterval(d)
                          , r = y.getCurrentTime()
                          , a = y.getElement(y.container).querySelector("." + y.options.classPrefix + "volume-slider");
                        if (38 === t || 40 === t) {
                            a && (a.style.display = "block"),
                            y.isVideo && (y.showControls(),
                            y.startControlsTimer());
                            var s = 38 === t ? Math.min(y.volume + .1, 1) : Math.max(y.volume - .1, 0)
                              , l = s <= 0;
                            return y.setVolume(s),
                            void y.setMuted(l)
                        }
                        switch (a && (a.style.display = "none"),
                        t) {
                        case 37:
                            y.getDuration() !== 1 / 0 && (r -= i);
                            break;
                        case 39:
                            y.getDuration() !== 1 / 0 && (r += o);
                            break;
                        case 36:
                            r = 0;
                            break;
                        case 35:
                            r = n;
                            break;
                        case 13:
                        case 32:
                            return void (g.IS_FIREFOX && (y.paused ? y.play() : y.pause()));
                        default:
                            return
                        }
                        r = r < 0 || isNaN(r) ? 0 : n <= r ? n : Math.floor(r),
                        u = new Date,
                        c || h.pause(),
                        r < y.getDuration() && !c && setTimeout(f, 1100),
                        y.setCurrentTime(r),
                        h.showControls(),
                        e.preventDefault(),
                        e.stopPropagation()
                    }
                });
                var r = ["mousedown", "touchstart"];
                y.slider.addEventListener("dragstart", function() {
                    return !1
                });
                for (var a = 0, l = r.length; a < l; a++)
                    y.slider.addEventListener(r[a], function(e) {
                        if (y.forcedHandlePause = !1,
                        y.getDuration() !== 1 / 0 && (1 === e.which || 0 === e.which)) {
                            y.paused || (y.pause(),
                            y.forcedHandlePause = !0),
                            v = !0,
                            i(e);
                            for (var t = ["mouseup", "touchend"], n = 0, o = t.length; n < o; n++)
                                y.getElement(y.container).addEventListener(t[n], function(e) {
                                    var t = e.target;
                                    (t === y.slider || t.closest("." + y.options.classPrefix + "time-slider")) && i(e)
                                });
                            y.globalBind("mouseup.dur touchend.dur", function() {
                                v && null !== y.getCurrentTime() && y.newTime.toFixed(4) !== y.getCurrentTime().toFixed(4) && (y.setCurrentTime(y.newTime),
                                y.setCurrentRailHandle(y.newTime),
                                y.updateCurrent(y.newTime)),
                                y.forcedHandlePause && (y.slider.focus(),
                                y.play()),
                                y.forcedHandlePause = !1,
                                v = !1,
                                y.timefloat && (y.timefloat.style.display = "none")
                            })
                        }
                    }, !(!g.SUPPORT_PASSIVE_EVENT || "touchstart" !== r[a]) && {
                        passive: !0
                    });
                y.slider.addEventListener("mouseenter", function(e) {
                    e.target === y.slider && y.getDuration() !== 1 / 0 && (y.getElement(y.container).addEventListener("mousemove", function(e) {
                        var t = e.target;
                        (t === y.slider || t.closest("." + y.options.classPrefix + "time-slider")) && i(e)
                    }),
                    !y.timefloat || g.IS_IOS || g.IS_ANDROID || (y.timefloat.style.display = "block"),
                    y.hovered && !g.IS_IOS && !g.IS_ANDROID && y.options.useSmoothHover && (0,
                    b.removeClass)(y.hovered, "no-hover"))
                }),
                y.slider.addEventListener("mouseleave", function() {
                    y.getDuration() !== 1 / 0 && (v || (y.timefloat && (y.timefloat.style.display = "none"),
                    y.hovered && y.options.useSmoothHover && (0,
                    b.addClass)(y.hovered, "no-hover")))
                }),
                y.broadcastCallback = function(e) {
                    var t, n, o, i, r = s.querySelector("." + y.options.classPrefix + "broadcast");
                    if (y.options.forceLive || y.getDuration() === 1 / 0) {
                        if (!r && y.options.forceLive) {
                            var a = p.default.createElement("span");
                            a.className = y.options.classPrefix + "broadcast",
                            a.innerText = m.default.t("mejs.live-broadcast"),
                            y.slider.style.display = "none",
                            y.rail.appendChild(a)
                        }
                    } else
                        r && (y.slider.style.display = "",
                        r.remove()),
                        h.setProgressRail(e),
                        y.forcedHandlePause || h.setCurrentRail(e),
                        t = y.getCurrentTime(),
                        n = m.default.t("mejs.time-slider"),
                        o = (0,
                        E.secondsToTimeCode)(t, h.options.alwaysShowHours, h.options.showTimecodeFrameCount, h.options.framesPerSecond, h.options.secondsDecimalLength, h.options.timeFormat),
                        i = y.getDuration(),
                        y.slider.setAttribute("role", "slider"),
                        y.slider.tabIndex = 0,
                        d.paused ? (y.slider.setAttribute("aria-label", n),
                        y.slider.setAttribute("aria-valuemin", 0),
                        y.slider.setAttribute("aria-valuemax", isNaN(i) ? 0 : i),
                        y.slider.setAttribute("aria-valuenow", t),
                        y.slider.setAttribute("aria-valuetext", o)) : (y.slider.removeAttribute("aria-label"),
                        y.slider.removeAttribute("aria-valuemin"),
                        y.slider.removeAttribute("aria-valuemax"),
                        y.slider.removeAttribute("aria-valuenow"),
                        y.slider.removeAttribute("aria-valuetext"))
                }
                ,
                d.addEventListener("progress", y.broadcastCallback),
                d.addEventListener("timeupdate", y.broadcastCallback),
                d.addEventListener("play", function() {
                    y.buffer.style.display = "none"
                }),
                d.addEventListener("playing", function() {
                    y.buffer.style.display = "none"
                }),
                d.addEventListener("seeking", function() {
                    y.buffer.style.display = ""
                }),
                d.addEventListener("seeked", function() {
                    y.buffer.style.display = "none"
                }),
                d.addEventListener("pause", function() {
                    y.buffer.style.display = "none"
                }),
                d.addEventListener("waiting", function() {
                    y.buffer.style.display = ""
                }),
                d.addEventListener("loadeddata", function() {
                    y.buffer.style.display = ""
                }),
                d.addEventListener("canplay", function() {
                    y.buffer.style.display = "none"
                }),
                d.addEventListener("error", function() {
                    y.buffer.style.display = "none"
                }),
                y.getElement(y.container).addEventListener("controlsresize", function(e) {
                    y.getDuration() !== 1 / 0 && (h.setProgressRail(e),
                    y.forcedHandlePause || h.setCurrentRail(e))
                })
            },
            cleanprogress: function(e, t, n, o) {
                o.removeEventListener("progress", e.broadcastCallback),
                o.removeEventListener("timeupdate", e.broadcastCallback),
                e.rail && e.rail.remove()
            },
            setProgressRail: function(e) {
                var t = this
                  , n = void 0 !== e ? e.detail.target || e.target : t.media
                  , o = null;
                n && n.buffered && 0 < n.buffered.length && n.buffered.end && t.getDuration() ? o = n.buffered.end(n.buffered.length - 1) / t.getDuration() : n && void 0 !== n.bytesTotal && 0 < n.bytesTotal && void 0 !== n.bufferedBytes ? o = n.bufferedBytes / n.bytesTotal : e && e.lengthComputable && 0 !== e.total && (o = e.loaded / e.total),
                null !== o && (o = Math.min(1, Math.max(0, o)),
                t.loaded && t.setTransformStyle(t.loaded, "scaleX(" + o + ")"))
            },
            setCurrentRailHandle: function(e) {
                this.setCurrentRailMain(this, e)
            },
            setCurrentRail: function() {
                this.setCurrentRailMain(this)
            },
            setCurrentRailMain: function(e, t) {
                if (void 0 !== e.getCurrentTime() && e.getDuration()) {
                    var n = void 0 === t ? e.getCurrentTime() : t;
                    if (e.total && e.handle) {
                        var o = parseFloat(getComputedStyle(e.total).width)
                          , i = Math.round(o * n / e.getDuration())
                          , r = i - Math.round(e.handle.offsetWidth / 2);
                        if (r = r < 0 ? 0 : r,
                        e.setTransformStyle(e.current, "scaleX(" + i / o + ")"),
                        e.setTransformStyle(e.handle, "translateX(" + r + "px)"),
                        e.options.useSmoothHover && !(0,
                        b.hasClass)(e.hovered, "no-hover")) {
                            var a = parseInt(e.hovered.getAttribute("pos"), 10)
                              , s = (a = isNaN(a) ? 0 : a) / o - r / o;
                            e.hovered.style.left = r + "px",
                            e.setTransformStyle(e.hovered, "scaleX(" + s + ")"),
                            0 <= s ? (0,
                            b.removeClass)(e.hovered, "negative") : (0,
                            b.addClass)(e.hovered, "negative")
                        }
                    }
                }
            }
        })
    }
    , {
        18: 18,
        2: 2,
        27: 27,
        28: 28,
        32: 32,
        7: 7
    }],
    14: [function(e, t, n) {
        "use strict";
        var a = r(e(2))
          , o = e(18)
          , i = r(o)
          , s = e(32)
          , l = e(28);
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(o.config, {
            duration: 0,
            timeAndDurationSeparator: "<span> | </span>"
        }),
        Object.assign(i.default.prototype, {
            buildcurrent: function(e, t, n, o) {
                var i = this
                  , r = a.default.createElement("div");
                r.className = i.options.classPrefix + "time",
                r.setAttribute("role", "timer"),
                r.setAttribute("aria-live", "off"),
                r.innerHTML = '<span class="' + i.options.classPrefix + 'currenttime">' + (0,
                s.secondsToTimeCode)(0, e.options.alwaysShowHours, e.options.showTimecodeFrameCount, e.options.framesPerSecond, e.options.secondsDecimalLength, e.options.timeFormat) + "</span>",
                i.addControlElement(r, "current"),
                e.updateCurrent(),
                i.updateTimeCallback = function() {
                    i.controlsAreVisible && e.updateCurrent()
                }
                ,
                o.addEventListener("timeupdate", i.updateTimeCallback)
            },
            cleancurrent: function(e, t, n, o) {
                o.removeEventListener("timeupdate", e.updateTimeCallback)
            },
            buildduration: function(e, t, n, o) {
                var i = this;
                if (t.lastChild.querySelector("." + i.options.classPrefix + "currenttime"))
                    t.querySelector("." + i.options.classPrefix + "time").innerHTML += i.options.timeAndDurationSeparator + '<span class="' + i.options.classPrefix + 'duration">' + (0,
                    s.secondsToTimeCode)(i.options.duration, i.options.alwaysShowHours, i.options.showTimecodeFrameCount, i.options.framesPerSecond, i.options.secondsDecimalLength, i.options.timeFormat) + "</span>";
                else {
                    t.querySelector("." + i.options.classPrefix + "currenttime") && (0,
                    l.addClass)(t.querySelector("." + i.options.classPrefix + "currenttime").parentNode, i.options.classPrefix + "currenttime-container");
                    var r = a.default.createElement("div");
                    r.className = i.options.classPrefix + "time " + i.options.classPrefix + "duration-container",
                    r.innerHTML = '<span class="' + i.options.classPrefix + 'duration">' + (0,
                    s.secondsToTimeCode)(i.options.duration, i.options.alwaysShowHours, i.options.showTimecodeFrameCount, i.options.framesPerSecond, i.options.secondsDecimalLength, i.options.timeFormat) + "</span>",
                    i.addControlElement(r, "duration")
                }
                i.updateDurationCallback = function() {
                    i.controlsAreVisible && e.updateDuration()
                }
                ,
                o.addEventListener("timeupdate", i.updateDurationCallback)
            },
            cleanduration: function(e, t, n, o) {
                o.removeEventListener("timeupdate", e.updateDurationCallback)
            },
            updateCurrent: function() {
                var e = this
                  , t = e.getCurrentTime();
                isNaN(t) && (t = 0);
                var n = (0,
                s.secondsToTimeCode)(t, e.options.alwaysShowHours, e.options.showTimecodeFrameCount, e.options.framesPerSecond, e.options.secondsDecimalLength, e.options.timeFormat);
                5 < n.length ? (0,
                l.addClass)(e.getElement(e.container), e.options.classPrefix + "long-video") : (0,
                l.removeClass)(e.getElement(e.container), e.options.classPrefix + "long-video"),
                e.getElement(e.controls).querySelector("." + e.options.classPrefix + "currenttime") && (e.getElement(e.controls).querySelector("." + e.options.classPrefix + "currenttime").innerText = n)
            },
            updateDuration: function() {
                var e = this
                  , t = e.getDuration();
                void 0 !== e.media && (isNaN(t) || t === 1 / 0 || t < 0) && (e.media.duration = e.options.duration = t = 0),
                0 < e.options.duration && (t = e.options.duration);
                var n = (0,
                s.secondsToTimeCode)(t, e.options.alwaysShowHours, e.options.showTimecodeFrameCount, e.options.framesPerSecond, e.options.secondsDecimalLength, e.options.timeFormat);
                5 < n.length ? (0,
                l.addClass)(e.getElement(e.container), e.options.classPrefix + "long-video") : (0,
                l.removeClass)(e.getElement(e.container), e.options.classPrefix + "long-video"),
                e.getElement(e.controls).querySelector("." + e.options.classPrefix + "duration") && 0 < t && (e.getElement(e.controls).querySelector("." + e.options.classPrefix + "duration").innerHTML = n)
            }
        })
    }
    , {
        18: 18,
        2: 2,
        28: 28,
        32: 32
    }],
    15: [function(e, t, n) {
        "use strict";
        var L = r(e(2))
          , d = r(e(9))
          , F = r(e(7))
          , o = e(18)
          , i = r(o)
          , m = e(32)
          , I = e(29)
          , j = e(28);
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(o.config, {
            startLanguage: "",
            tracksText: null,
            chaptersText: null,
            tracksAriaLive: !1,
            hideCaptionsButtonWhenEmpty: !0,
            toggleCaptionsButtonWhenOnlyOne: !1,
            slidesSelector: ""
        }),
        Object.assign(i.default.prototype, {
            hasChapters: !1,
            buildtracks: function(o, e, t, n) {
                if (this.findTracks(),
                o.tracks.length || o.trackFiles && 0 !== !o.trackFiles.length) {
                    var i = this
                      , r = i.options.tracksAriaLive ? ' role="log" aria-live="assertive" aria-atomic="false"' : ""
                      , a = (0,
                    I.isString)(i.options.tracksText) ? i.options.tracksText : F.default.t("mejs.captions-subtitles")
                      , s = (0,
                    I.isString)(i.options.chaptersText) ? i.options.chaptersText : F.default.t("mejs.captions-chapters")
                      , l = null === o.trackFiles ? o.tracks.length : o.trackFiles.length;
                    if (i.domNode.textTracks)
                        for (var d = i.domNode.textTracks.length - 1; 0 <= d; d--)
                            i.domNode.textTracks[d].mode = "hidden";
                    i.cleartracks(o),
                    o.captions = L.default.createElement("div"),
                    o.captions.className = i.options.classPrefix + "captions-layer " + i.options.classPrefix + "layer",
                    o.captions.innerHTML = '<div class="' + i.options.classPrefix + "captions-position " + i.options.classPrefix + 'captions-position-hover"' + r + '><span class="' + i.options.classPrefix + 'captions-text"></span></div>',
                    o.captions.style.display = "none",
                    t.insertBefore(o.captions, t.firstChild),
                    o.captionsText = o.captions.querySelector("." + i.options.classPrefix + "captions-text"),
                    o.captionsButton = L.default.createElement("div"),
                    o.captionsButton.className = i.options.classPrefix + "button " + i.options.classPrefix + "captions-button",
                    o.captionsButton.innerHTML = '<button type="button" aria-controls="' + i.id + '" title="' + a + '" aria-label="' + a + '" tabindex="0"></button><div class="' + i.options.classPrefix + "captions-selector " + i.options.classPrefix + 'offscreen"><ul class="' + i.options.classPrefix + 'captions-selector-list"><li class="' + i.options.classPrefix + 'captions-selector-list-item"><input type="radio" class="' + i.options.classPrefix + 'captions-selector-input" name="' + o.id + '_captions" id="' + o.id + '_captions_none" value="none" checked disabled><label class="' + i.options.classPrefix + "captions-selector-label " + i.options.classPrefix + 'captions-selected" for="' + o.id + '_captions_none">' + F.default.t("mejs.none") + "</label></li></ul></div>",
                    i.addControlElement(o.captionsButton, "tracks"),
                    o.captionsButton.querySelector("." + i.options.classPrefix + "captions-selector-input").disabled = !1,
                    o.chaptersButton = L.default.createElement("div"),
                    o.chaptersButton.className = i.options.classPrefix + "button " + i.options.classPrefix + "chapters-button",
                    o.chaptersButton.innerHTML = '<button type="button" aria-controls="' + i.id + '" title="' + s + '" aria-label="' + s + '" tabindex="0"></button><div class="' + i.options.classPrefix + "chapters-selector " + i.options.classPrefix + 'offscreen"><ul class="' + i.options.classPrefix + 'chapters-selector-list"></ul></div>';
                    for (var u = 0, c = 0; c < l; c++) {
                        var f = o.tracks[c].kind;
                        o.tracks[c].src.trim() && ("subtitles" === f || "captions" === f ? u++ : "chapters" !== f || e.querySelector("." + i.options.classPrefix + "chapter-selector") || o.captionsButton.parentNode.insertBefore(o.chaptersButton, o.captionsButton))
                    }
                    o.trackToLoad = -1,
                    o.selectedTrack = null,
                    o.isLoadingTrack = !1;
                    for (var p = 0; p < l; p++) {
                        var m = o.tracks[p].kind;
                        !o.tracks[p].src.trim() || "subtitles" !== m && "captions" !== m || o.addTrackButton(o.tracks[p].trackId, o.tracks[p].srclang, o.tracks[p].label)
                    }
                    o.loadNextTrack();
                    var h = ["mouseenter", "focusin"]
                      , v = ["mouseleave", "focusout"];
                    if (i.options.toggleCaptionsButtonWhenOnlyOne && 1 === u)
                        o.captionsButton.addEventListener("click", function(e) {
                            var t = "none";
                            null === o.selectedTrack && (t = o.tracks[0].trackId);
                            var n = e.keyCode || e.which;
                            o.setTrack(t, void 0 !== n)
                        });
                    else {
                        for (var y = o.captionsButton.querySelectorAll("." + i.options.classPrefix + "captions-selector-label"), g = o.captionsButton.querySelectorAll("input[type=radio]"), E = 0, b = h.length; E < b; E++)
                            o.captionsButton.addEventListener(h[E], function() {
                                (0,
                                j.removeClass)(this.querySelector("." + i.options.classPrefix + "captions-selector"), i.options.classPrefix + "offscreen")
                            });
                        for (var S = 0, w = v.length; S < w; S++)
                            o.captionsButton.addEventListener(v[S], function() {
                                (0,
                                j.addClass)(this.querySelector("." + i.options.classPrefix + "captions-selector"), i.options.classPrefix + "offscreen")
                            });
                        for (var x = 0, T = g.length; x < T; x++)
                            g[x].addEventListener("click", function(e) {
                                var t = e.keyCode || e.which;
                                o.setTrack(this.value, void 0 !== t)
                            });
                        for (var P = 0, C = y.length; P < C; P++)
                            y[P].addEventListener("click", function(e) {
                                var t = (0,
                                j.siblings)(this, function(e) {
                                    return "INPUT" === e.tagName
                                })[0]
                                  , n = (0,
                                I.createEvent)("click", t);
                                t.dispatchEvent(n),
                                e.preventDefault()
                            });
                        o.captionsButton.addEventListener("keydown", function(e) {
                            e.stopPropagation()
                        })
                    }
                    for (var k = 0, _ = h.length; k < _; k++)
                        o.chaptersButton.addEventListener(h[k], function() {
                            this.querySelector("." + i.options.classPrefix + "chapters-selector-list").children.length && (0,
                            j.removeClass)(this.querySelector("." + i.options.classPrefix + "chapters-selector"), i.options.classPrefix + "offscreen")
                        });
                    for (var N = 0, A = v.length; N < A; N++)
                        o.chaptersButton.addEventListener(v[N], function() {
                            (0,
                            j.addClass)(this.querySelector("." + i.options.classPrefix + "chapters-selector"), i.options.classPrefix + "offscreen")
                        });
                    o.chaptersButton.addEventListener("keydown", function(e) {
                        e.stopPropagation()
                    }),
                    o.options.alwaysShowControls ? (0,
                    j.addClass)(o.getElement(o.container).querySelector("." + i.options.classPrefix + "captions-position"), i.options.classPrefix + "captions-position-hover") : (o.getElement(o.container).addEventListener("controlsshown", function() {
                        (0,
                        j.addClass)(o.getElement(o.container).querySelector("." + i.options.classPrefix + "captions-position"), i.options.classPrefix + "captions-position-hover")
                    }),
                    o.getElement(o.container).addEventListener("controlshidden", function() {
                        n.paused || (0,
                        j.removeClass)(o.getElement(o.container).querySelector("." + i.options.classPrefix + "captions-position"), i.options.classPrefix + "captions-position-hover")
                    })),
                    n.addEventListener("timeupdate", function() {
                        o.displayCaptions()
                    }),
                    "" !== o.options.slidesSelector && (o.slidesContainer = L.default.querySelectorAll(o.options.slidesSelector),
                    n.addEventListener("timeupdate", function() {
                        o.displaySlides()
                    }))
                }
            },
            cleartracks: function(e) {
                e && (e.captions && e.captions.remove(),
                e.chapters && e.chapters.remove(),
                e.captionsText && e.captionsText.remove(),
                e.captionsButton && e.captionsButton.remove(),
                e.chaptersButton && e.chaptersButton.remove())
            },
            rebuildtracks: function() {
                var e = this;
                e.findTracks(),
                e.buildtracks(e, e.getElement(e.controls), e.getElement(e.layers), e.media)
            },
            findTracks: function() {
                var e = this
                  , t = null === e.trackFiles ? e.node.querySelectorAll("track") : e.trackFiles
                  , n = t.length;
                e.tracks = [];
                for (var o = 0; o < n; o++) {
                    var i = t[o]
                      , r = i.getAttribute("srclang").toLowerCase() || ""
                      , a = e.id + "_track_" + o + "_" + i.getAttribute("kind") + "_" + r;
                    e.tracks.push({
                        trackId: a,
                        srclang: r,
                        src: i.getAttribute("src"),
                        kind: i.getAttribute("kind"),
                        label: i.getAttribute("label") || "",
                        entries: [],
                        isLoaded: !1
                    })
                }
            },
            setTrack: function(e, t) {
                for (var n = this, o = n.captionsButton.querySelectorAll('input[type="radio"]'), i = n.captionsButton.querySelectorAll("." + n.options.classPrefix + "captions-selected"), r = n.captionsButton.querySelector('input[value="' + e + '"]'), a = 0, s = o.length; a < s; a++)
                    o[a].checked = !1;
                for (var l = 0, d = i.length; l < d; l++)
                    (0,
                    j.removeClass)(i[l], n.options.classPrefix + "captions-selected");
                r.checked = !0;
                for (var u = (0,
                j.siblings)(r, function(e) {
                    return (0,
                    j.hasClass)(e, n.options.classPrefix + "captions-selector-label")
                }), c = 0, f = u.length; c < f; c++)
                    (0,
                    j.addClass)(u[c], n.options.classPrefix + "captions-selected");
                if ("none" === e)
                    n.selectedTrack = null,
                    (0,
                    j.removeClass)(n.captionsButton, n.options.classPrefix + "captions-enabled");
                else
                    for (var p = 0, m = n.tracks.length; p < m; p++) {
                        var h = n.tracks[p];
                        if (h.trackId === e) {
                            null === n.selectedTrack && (0,
                            j.addClass)(n.captionsButton, n.options.classPrefix + "captions-enabled"),
                            n.selectedTrack = h,
                            n.captions.setAttribute("lang", n.selectedTrack.srclang),
                            n.displayCaptions();
                            break
                        }
                    }
                var v = (0,
                I.createEvent)("captionschange", n.media);
                v.detail.caption = n.selectedTrack,
                n.media.dispatchEvent(v),
                t || setTimeout(function() {
                    n.getElement(n.container).focus()
                }, 500)
            },
            loadNextTrack: function() {
                var e = this;
                e.trackToLoad++,
                e.trackToLoad < e.tracks.length ? (e.isLoadingTrack = !0,
                e.loadTrack(e.trackToLoad)) : (e.isLoadingTrack = !1,
                e.checkForTracks())
            },
            loadTrack: function(e) {
                var t = this
                  , n = t.tracks[e];
                void 0 === n || void 0 === n.src && "" === n.src || (0,
                j.ajax)(n.src, "text", function(e) {
                    n.entries = "string" == typeof e && /<tt\s+xml/gi.exec(e) ? d.default.TrackFormatParser.dfxp.parse(e) : d.default.TrackFormatParser.webvtt.parse(e),
                    n.isLoaded = !0,
                    t.enableTrackButton(n),
                    t.loadNextTrack(),
                    "slides" === n.kind ? t.setupSlides(n) : "chapters" !== n.kind || t.hasChapters || (t.drawChapters(n),
                    t.hasChapters = !0)
                }, function() {
                    t.removeTrackButton(n.trackId),
                    t.loadNextTrack()
                })
            },
            enableTrackButton: function(e) {
                var t = this
                  , n = e.srclang
                  , o = L.default.getElementById("" + e.trackId);
                if (o) {
                    var i = e.label;
                    "" === i && (i = F.default.t(d.default.language.codes[n]) || n),
                    o.disabled = !1;
                    for (var r = (0,
                    j.siblings)(o, function(e) {
                        return (0,
                        j.hasClass)(e, t.options.classPrefix + "captions-selector-label")
                    }), a = 0, s = r.length; a < s; a++)
                        r[a].innerHTML = i;
                    if (t.options.startLanguage === n) {
                        o.checked = !0;
                        var l = (0,
                        I.createEvent)("click", o);
                        o.dispatchEvent(l)
                    }
                }
            },
            removeTrackButton: function(e) {
                var t = L.default.getElementById("" + e);
                if (t) {
                    var n = t.closest("li");
                    n && n.remove()
                }
            },
            addTrackButton: function(e, t, n) {
                var o = this;
                "" === n && (n = F.default.t(d.default.language.codes[t]) || t),
                o.captionsButton.querySelector("ul").innerHTML += '<li class="' + o.options.classPrefix + 'captions-selector-list-item"><input type="radio" class="' + o.options.classPrefix + 'captions-selector-input" name="' + o.id + '_captions" id="' + e + '" value="' + e + '" disabled><label class="' + o.options.classPrefix + 'captions-selector-label"for="' + e + '">' + n + " (loading)</label></li>"
            },
            checkForTracks: function() {
                var e = this
                  , t = !1;
                if (e.options.hideCaptionsButtonWhenEmpty) {
                    for (var n = 0, o = e.tracks.length; n < o; n++) {
                        var i = e.tracks[n].kind;
                        if (("subtitles" === i || "captions" === i) && e.tracks[n].isLoaded) {
                            t = !0;
                            break
                        }
                    }
                    e.captionsButton.style.display = t ? "" : "none",
                    e.setControlsSize()
                }
            },
            displayCaptions: function() {
                if (void 0 !== this.tracks) {
                    var e = this
                      , t = e.selectedTrack;
                    if (null !== t && t.isLoaded) {
                        var n = e.searchTrackPosition(t.entries, e.media.currentTime);
                        if (-1 < n)
                            return e.captionsText.innerHTML = function(e) {
                                var t = L.default.createElement("div");
                                t.innerHTML = e;
                                for (var n = t.getElementsByTagName("script"), o = n.length; o--; )
                                    n[o].remove();
                                for (var i = t.getElementsByTagName("*"), r = 0, a = i.length; r < a; r++)
                                    for (var s = i[r].attributes, l = Array.prototype.slice.call(s), d = 0, u = l.length; d < u; d++)
                                        l[d].name.startsWith("on") || l[d].value.startsWith("javascript") ? i[r].remove() : "style" === l[d].name && i[r].removeAttribute(l[d].name);
                                return t.innerHTML
                            }(t.entries[n].text),
                            e.captionsText.className = e.options.classPrefix + "captions-text " + (t.entries[n].identifier || ""),
                            e.captions.style.display = "",
                            void (e.captions.style.height = "0px");
                        e.captions.style.display = "none"
                    } else
                        e.captions.style.display = "none"
                }
            },
            setupSlides: function(e) {
                this.slides = e,
                this.slides.entries.imgs = [this.slides.entries.length],
                this.showSlide(0)
            },
            showSlide: function(e) {
                var i = this
                  , r = this;
                if (void 0 !== r.tracks && void 0 !== r.slidesContainer) {
                    var t = r.slides.entries[e].text
                      , n = r.slides.entries[e].imgs;
                    if (void 0 === n || void 0 === n.fadeIn) {
                        var a = L.default.createElement("img");
                        a.src = t,
                        a.addEventListener("load", function() {
                            var e = i
                              , t = (0,
                            j.siblings)(e, function(e) {
                                return t(e)
                            });
                            e.style.display = "none",
                            r.slidesContainer.innerHTML += e.innerHTML,
                            (0,
                            j.fadeIn)(r.slidesContainer.querySelector(a));
                            for (var n = 0, o = t.length; n < o; n++)
                                (0,
                                j.fadeOut)(t[n], 400)
                        }),
                        r.slides.entries[e].imgs = n = a
                    } else if (!(0,
                    j.visible)(n)) {
                        var o = (0,
                        j.siblings)(self, function(e) {
                            return o(e)
                        });
                        (0,
                        j.fadeIn)(r.slidesContainer.querySelector(n));
                        for (var s = 0, l = o.length; s < l; s++)
                            (0,
                            j.fadeOut)(o[s])
                    }
                }
            },
            displaySlides: function() {
                if (void 0 !== this.slides) {
                    var e = this.slides
                      , t = this.searchTrackPosition(e.entries, this.media.currentTime);
                    -1 < t && this.showSlide(t)
                }
            },
            drawChapters: function(e) {
                var r = this
                  , t = e.entries.length;
                if (t) {
                    r.chaptersButton.querySelector("ul").innerHTML = "";
                    for (var n = 0; n < t; n++)
                        r.chaptersButton.querySelector("ul").innerHTML += '<li class="' + r.options.classPrefix + 'chapters-selector-list-item" role="menuitemcheckbox" aria-live="polite" aria-disabled="false" aria-checked="false"><input type="radio" class="' + r.options.classPrefix + 'captions-selector-input" name="' + r.id + '_chapters" id="' + r.id + "_chapters_" + n + '" value="' + e.entries[n].start + '" disabled><label class="' + r.options.classPrefix + 'chapters-selector-label"for="' + r.id + "_chapters_" + n + '">' + e.entries[n].text + "</label></li>";
                    for (var o = r.chaptersButton.querySelectorAll('input[type="radio"]'), i = r.chaptersButton.querySelectorAll("." + r.options.classPrefix + "chapters-selector-label"), a = 0, s = o.length; a < s; a++)
                        o[a].disabled = !1,
                        o[a].checked = !1,
                        o[a].addEventListener("click", function(e) {
                            var t = r.chaptersButton.querySelectorAll("li")
                              , n = (0,
                            j.siblings)(this, function(e) {
                                return (0,
                                j.hasClass)(e, r.options.classPrefix + "chapters-selector-label")
                            })[0];
                            this.checked = !0,
                            this.parentNode.setAttribute("aria-checked", !0),
                            (0,
                            j.addClass)(n, r.options.classPrefix + "chapters-selected"),
                            (0,
                            j.removeClass)(r.chaptersButton.querySelector("." + r.options.classPrefix + "chapters-selected"), r.options.classPrefix + "chapters-selected");
                            for (var o = 0, i = t.length; o < i; o++)
                                t[o].setAttribute("aria-checked", !1);
                            void 0 === (e.keyCode || e.which) && setTimeout(function() {
                                r.getElement(r.container).focus()
                            }, 500),
                            r.media.setCurrentTime(parseFloat(this.value)),
                            r.media.paused && r.media.play()
                        });
                    for (var l = 0, d = i.length; l < d; l++)
                        i[l].addEventListener("click", function(e) {
                            var t = (0,
                            j.siblings)(this, function(e) {
                                return "INPUT" === e.tagName
                            })[0]
                              , n = (0,
                            I.createEvent)("click", t);
                            t.dispatchEvent(n),
                            e.preventDefault()
                        })
                }
            },
            searchTrackPosition: function(e, t) {
                for (var n = 0, o = e.length - 1, i = void 0, r = void 0, a = void 0; n <= o; ) {
                    if (r = e[i = n + o >> 1].start,
                    a = e[i].stop,
                    r <= t && t < a)
                        return i;
                    r < t ? n = i + 1 : t < r && (o = i - 1)
                }
                return -1
            }
        }),
        d.default.language = {
            codes: {
                af: "mejs.afrikaans",
                sq: "mejs.albanian",
                ar: "mejs.arabic",
                be: "mejs.belarusian",
                bg: "mejs.bulgarian",
                ca: "mejs.catalan",
                zh: "mejs.chinese",
                "zh-cn": "mejs.chinese-simplified",
                "zh-tw": "mejs.chines-traditional",
                hr: "mejs.croatian",
                cs: "mejs.czech",
                da: "mejs.danish",
                nl: "mejs.dutch",
                en: "mejs.english",
                et: "mejs.estonian",
                fl: "mejs.filipino",
                fi: "mejs.finnish",
                fr: "mejs.french",
                gl: "mejs.galician",
                de: "mejs.german",
                el: "mejs.greek",
                ht: "mejs.haitian-creole",
                iw: "mejs.hebrew",
                hi: "mejs.hindi",
                hu: "mejs.hungarian",
                is: "mejs.icelandic",
                id: "mejs.indonesian",
                ga: "mejs.irish",
                it: "mejs.italian",
                ja: "mejs.japanese",
                ko: "mejs.korean",
                lv: "mejs.latvian",
                lt: "mejs.lithuanian",
                mk: "mejs.macedonian",
                ms: "mejs.malay",
                mt: "mejs.maltese",
                no: "mejs.norwegian",
                fa: "mejs.persian",
                pl: "mejs.polish",
                pt: "mejs.portuguese",
                ro: "mejs.romanian",
                ru: "mejs.russian",
                sr: "mejs.serbian",
                sk: "mejs.slovak",
                sl: "mejs.slovenian",
                es: "mejs.spanish",
                sw: "mejs.swahili",
                sv: "mejs.swedish",
                tl: "mejs.tagalog",
                th: "mejs.thai",
                tr: "mejs.turkish",
                uk: "mejs.ukrainian",
                vi: "mejs.vietnamese",
                cy: "mejs.welsh",
                yi: "mejs.yiddish"
            }
        },
        d.default.TrackFormatParser = {
            webvtt: {
                pattern: /^((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{1,3})?) --\> ((?:[0-9]{1,2}:)?[0-9]{2}:[0-9]{2}([,.][0-9]{3})?)(.*)$/,
                parse: function(e) {
                    for (var t = e.split(/\r?\n/), n = [], o = void 0, i = void 0, r = void 0, a = 0, s = t.length; a < s; a++) {
                        if ((o = this.pattern.exec(t[a])) && a < t.length) {
                            for (0 <= a - 1 && "" !== t[a - 1] && (r = t[a - 1]),
                            i = t[++a],
                            a++; "" !== t[a] && a < t.length; )
                                i = i + "\n" + t[a],
                                a++;
                            i = i.trim().replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi, "<a href='$1' target='_blank'>$1</a>"),
                            n.push({
                                identifier: r,
                                start: 0 === (0,
                                m.convertSMPTEtoSeconds)(o[1]) ? .2 : (0,
                                m.convertSMPTEtoSeconds)(o[1]),
                                stop: (0,
                                m.convertSMPTEtoSeconds)(o[3]),
                                text: i,
                                settings: o[5]
                            })
                        }
                        r = ""
                    }
                    return n
                }
            },
            dfxp: {
                parse: function(e) {
                    var t = (e = $(e).filter("tt")).firstChild
                      , n = t.querySelectorAll("p")
                      , o = e.getElementById("" + t.attr("style"))
                      , i = []
                      , r = void 0;
                    if (o.length) {
                        o.removeAttribute("id");
                        var a = o.attributes;
                        if (a.length) {
                            r = {};
                            for (var s = 0, l = a.length; s < l; s++)
                                r[a[s].name.split(":")[1]] = a[s].value
                        }
                    }
                    for (var d = 0, u = n.length; d < u; d++) {
                        var c = void 0
                          , f = {
                            start: null,
                            stop: null,
                            style: null,
                            text: null
                        };
                        if (n.eq(d).attr("begin") && (f.start = (0,
                        m.convertSMPTEtoSeconds)(n.eq(d).attr("begin"))),
                        !f.start && n.eq(d - 1).attr("end") && (f.start = (0,
                        m.convertSMPTEtoSeconds)(n.eq(d - 1).attr("end"))),
                        n.eq(d).attr("end") && (f.stop = (0,
                        m.convertSMPTEtoSeconds)(n.eq(d).attr("end"))),
                        !f.stop && n.eq(d + 1).attr("begin") && (f.stop = (0,
                        m.convertSMPTEtoSeconds)(n.eq(d + 1).attr("begin"))),
                        r)
                            for (var p in c = "",
                            r)
                                c += p + ":" + r[p] + ";";
                        c && (f.style = c),
                        0 === f.start && (f.start = .2),
                        f.text = n.eq(d).innerHTML.trim().replace(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi, "<a href='$1' target='_blank'>$1</a>"),
                        i.push(f)
                    }
                    return i
                }
            }
        }
    }
    , {
        18: 18,
        2: 2,
        28: 28,
        29: 29,
        32: 32,
        7: 7,
        9: 9
    }],
    16: [function(e, t, n) {
        "use strict";
        var w = i(e(2))
          , x = e(18)
          , o = i(x)
          , T = i(e(7))
          , P = e(27)
          , C = e(29)
          , k = e(28);
        function i(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        Object.assign(x.config, {
            muteText: null,
            unmuteText: null,
            allyVolumeControlText: null,
            hideVolumeOnTouchDevices: !0,
            audioVolume: "horizontal",
            videoVolume: "vertical",
            startVolume: .8
        }),
        Object.assign(o.default.prototype, {
            buildvolume: function(e, t, n, o) {
                if (!P.IS_ANDROID && !P.IS_IOS || !this.options.hideVolumeOnTouchDevices) {
                    var a = this
                      , s = a.isVideo ? a.options.videoVolume : a.options.audioVolume
                      , r = (0,
                    C.isString)(a.options.muteText) ? a.options.muteText : T.default.t("mejs.mute")
                      , l = (0,
                    C.isString)(a.options.unmuteText) ? a.options.unmuteText : T.default.t("mejs.unmute")
                      , i = (0,
                    C.isString)(a.options.allyVolumeControlText) ? a.options.allyVolumeControlText : T.default.t("mejs.volume-help-text")
                      , d = w.default.createElement("div");
                    if (d.className = a.options.classPrefix + "button " + a.options.classPrefix + "volume-button " + a.options.classPrefix + "mute",
                    d.innerHTML = "horizontal" === s ? '<button type="button" aria-controls="' + a.id + '" title="' + r + '" aria-label="' + r + '" tabindex="0"></button>' : '<button type="button" aria-controls="' + a.id + '" title="' + r + '" aria-label="' + r + '" tabindex="0"></button><a href="javascript:void(0);" class="' + a.options.classPrefix + 'volume-slider" aria-label="' + T.default.t("mejs.volume-slider") + '" aria-valuemin="0" aria-valuemax="100" role="slider" aria-orientation="vertical"><span class="' + a.options.classPrefix + 'offscreen">' + i + '</span><div class="' + a.options.classPrefix + 'volume-total"><div class="' + a.options.classPrefix + 'volume-current"></div><div class="' + a.options.classPrefix + 'volume-handle"></div></div></a>',
                    a.addControlElement(d, "volume"),
                    a.options.keyActions.push({
                        keys: [38],
                        action: function(e) {
                            var t = e.getElement(e.container).querySelector("." + x.config.classPrefix + "volume-slider");
                            t && t.matches(":focus") && (t.style.display = "block"),
                            e.isVideo && (e.showControls(),
                            e.startControlsTimer());
                            var n = Math.min(e.volume + .1, 1);
                            e.setVolume(n),
                            0 < n && e.setMuted(!1)
                        }
                    }, {
                        keys: [40],
                        action: function(e) {
                            var t = e.getElement(e.container).querySelector("." + x.config.classPrefix + "volume-slider");
                            t && (t.style.display = "block"),
                            e.isVideo && (e.showControls(),
                            e.startControlsTimer());
                            var n = Math.max(e.volume - .1, 0);
                            e.setVolume(n),
                            n <= .1 && e.setMuted(!0)
                        }
                    }, {
                        keys: [77],
                        action: function(e) {
                            e.getElement(e.container).querySelector("." + x.config.classPrefix + "volume-slider").style.display = "block",
                            e.isVideo && (e.showControls(),
                            e.startControlsTimer()),
                            e.media.muted ? e.setMuted(!1) : e.setMuted(!0)
                        }
                    }),
                    "horizontal" === s) {
                        var u = w.default.createElement("a");
                        u.className = a.options.classPrefix + "horizontal-volume-slider",
                        u.href = "javascript:void(0);",
                        u.setAttribute("aria-label", T.default.t("mejs.volume-slider")),
                        u.setAttribute("aria-valuemin", 0),
                        u.setAttribute("aria-valuemax", 100),
                        u.setAttribute("aria-valuenow", 100),
                        u.setAttribute("role", "slider"),
                        u.innerHTML += '<span class="' + a.options.classPrefix + 'offscreen">' + i + '</span><div class="' + a.options.classPrefix + 'horizontal-volume-total"><div class="' + a.options.classPrefix + 'horizontal-volume-current"></div><div class="' + a.options.classPrefix + 'horizontal-volume-handle"></div></div>',
                        d.parentNode.insertBefore(u, d.nextSibling)
                    }
                    var c = !1
                      , f = !1
                      , p = !1
                      , m = "vertical" === s ? a.getElement(a.container).querySelector("." + a.options.classPrefix + "volume-slider") : a.getElement(a.container).querySelector("." + a.options.classPrefix + "horizontal-volume-slider")
                      , h = "vertical" === s ? a.getElement(a.container).querySelector("." + a.options.classPrefix + "volume-total") : a.getElement(a.container).querySelector("." + a.options.classPrefix + "horizontal-volume-total")
                      , v = "vertical" === s ? a.getElement(a.container).querySelector("." + a.options.classPrefix + "volume-current") : a.getElement(a.container).querySelector("." + a.options.classPrefix + "horizontal-volume-current")
                      , y = "vertical" === s ? a.getElement(a.container).querySelector("." + a.options.classPrefix + "volume-handle") : a.getElement(a.container).querySelector("." + a.options.classPrefix + "horizontal-volume-handle")
                      , g = function(e) {
                        if (null !== e && !isNaN(e) && void 0 !== e) {
                            if (e = Math.max(0, e),
                            0 === (e = Math.min(e, 1))) {
                                (0,
                                k.removeClass)(d, a.options.classPrefix + "mute"),
                                (0,
                                k.addClass)(d, a.options.classPrefix + "unmute");
                                var t = d.firstElementChild;
                                t.setAttribute("title", l),
                                t.setAttribute("aria-label", l)
                            } else {
                                (0,
                                k.removeClass)(d, a.options.classPrefix + "unmute"),
                                (0,
                                k.addClass)(d, a.options.classPrefix + "mute");
                                var n = d.firstElementChild;
                                n.setAttribute("title", r),
                                n.setAttribute("aria-label", r)
                            }
                            var o = 100 * e + "%"
                              , i = getComputedStyle(y);
                            "vertical" === s ? (v.style.bottom = 0,
                            v.style.height = o,
                            y.style.bottom = o,
                            y.style.marginBottom = -parseFloat(i.height) / 2 + "px") : (v.style.left = 0,
                            v.style.width = o,
                            y.style.left = o,
                            y.style.marginLeft = -parseFloat(i.width) / 2 + "px")
                        }
                    }
                      , E = function(e) {
                        var t = (0,
                        k.offset)(h)
                          , n = getComputedStyle(h);
                        p = !0;
                        var o = null;
                        if ("vertical" === s) {
                            var i = parseFloat(n.height);
                            if (o = (i - (e.pageY - t.top)) / i,
                            0 === t.top || 0 === t.left)
                                return
                        } else {
                            var r = parseFloat(n.width);
                            o = (e.pageX - t.left) / r
                        }
                        o = Math.max(0, o),
                        o = Math.min(o, 1),
                        g(o),
                        a.setMuted(0 === o),
                        a.setVolume(o),
                        e.preventDefault(),
                        e.stopPropagation()
                    }
                      , b = function() {
                        a.muted ? (g(0),
                        (0,
                        k.removeClass)(d, a.options.classPrefix + "mute"),
                        (0,
                        k.addClass)(d, a.options.classPrefix + "unmute")) : (g(o.volume),
                        (0,
                        k.removeClass)(d, a.options.classPrefix + "unmute"),
                        (0,
                        k.addClass)(d, a.options.classPrefix + "mute"))
                    };
                    e.getElement(e.container).addEventListener("keydown", function(e) {
                        !!e.target.closest("." + a.options.classPrefix + "container") || "vertical" !== s || (m.style.display = "none")
                    }),
                    d.addEventListener("mouseenter", function(e) {
                        e.target === d && (m.style.display = "block",
                        f = !0,
                        e.preventDefault(),
                        e.stopPropagation())
                    }),
                    d.addEventListener("focusin", function() {
                        m.style.display = "block",
                        f = !0
                    }),
                    d.addEventListener("focusout", function(e) {
                        e.relatedTarget && (!e.relatedTarget || e.relatedTarget.matches("." + a.options.classPrefix + "volume-slider")) || "vertical" !== s || (m.style.display = "none")
                    }),
                    d.addEventListener("mouseleave", function() {
                        f = !1,
                        c || "vertical" !== s || (m.style.display = "none")
                    }),
                    d.addEventListener("focusout", function() {
                        f = !1
                    }),
                    d.addEventListener("keydown", function(e) {
                        if (a.options.enableKeyboard && a.options.keyActions.length) {
                            var t = e.which || e.keyCode || 0
                              , n = o.volume;
                            switch (t) {
                            case 38:
                                n = Math.min(n + .1, 1);
                                break;
                            case 40:
                                n = Math.max(0, n - .1);
                                break;
                            default:
                                return !0
                            }
                            c = !1,
                            g(n),
                            o.setVolume(n),
                            e.preventDefault(),
                            e.stopPropagation()
                        }
                    }),
                    d.querySelector("button").addEventListener("click", function() {
                        o.setMuted(!o.muted);
                        var e = (0,
                        C.createEvent)("volumechange", o);
                        o.dispatchEvent(e)
                    }),
                    m.addEventListener("dragstart", function() {
                        return !1
                    }),
                    m.addEventListener("mouseover", function() {
                        f = !0
                    }),
                    m.addEventListener("focusin", function() {
                        m.style.display = "block",
                        f = !0
                    }),
                    m.addEventListener("focusout", function() {
                        f = !1,
                        c || "vertical" !== s || (m.style.display = "none")
                    }),
                    m.addEventListener("mousedown", function(e) {
                        E(e),
                        a.globalBind("mousemove.vol", function(e) {
                            var t = e.target;
                            c && (t === m || t.closest("vertical" === s ? "." + a.options.classPrefix + "volume-slider" : "." + a.options.classPrefix + "horizontal-volume-slider")) && E(e)
                        }),
                        a.globalBind("mouseup.vol", function() {
                            c = !1,
                            f || "vertical" !== s || (m.style.display = "none")
                        }),
                        c = !0,
                        e.preventDefault(),
                        e.stopPropagation()
                    }),
                    o.addEventListener("volumechange", function(e) {
                        var t;
                        c || b(),
                        t = Math.floor(100 * o.volume),
                        m.setAttribute("aria-valuenow", t),
                        m.setAttribute("aria-valuetext", t + "%")
                    });
                    var S = !1;
                    o.addEventListener("rendererready", function() {
                        p || setTimeout(function() {
                            S = !0,
                            (0 === e.options.startVolume || o.originalNode.muted) && (o.setMuted(!0),
                            e.options.startVolume = 0),
                            o.setVolume(e.options.startVolume),
                            a.setControlsSize()
                        }, 250)
                    }),
                    o.addEventListener("loadedmetadata", function() {
                        setTimeout(function() {
                            p || S || ((0 === e.options.startVolume || o.originalNode.muted) && o.setMuted(!0),
                            o.setVolume(e.options.startVolume),
                            a.setControlsSize()),
                            S = !1
                        }, 250)
                    }),
                    (0 === e.options.startVolume || o.originalNode.muted) && (o.setMuted(!0),
                    e.options.startVolume = 0,
                    b()),
                    a.getElement(a.container).addEventListener("controlsresize", function() {
                        b()
                    })
                }
            }
        })
    }
    , {
        18: 18,
        2: 2,
        27: 27,
        28: 28,
        29: 29,
        7: 7
    }],
    17: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        n.EN = {
            "mejs.plural-form": 1,
            "mejs.download-file": "Download File",
            "mejs.install-flash": "You are using a browser that does not have Flash player enabled or installed. Please turn on your Flash player plugin or download the latest version from https://get.adobe.com/flashplayer/",
            "mejs.fullscreen": "Fullscreen",
            "mejs.play": "Play",
            "mejs.pause": "Pause",
            "mejs.time-slider": "Time Slider",
            "mejs.time-help-text": "Use Left/Right Arrow keys to advance one second, Up/Down arrows to advance ten seconds.",
            "mejs.live-broadcast": "Live Broadcast",
            "mejs.volume-help-text": "Use Up/Down Arrow keys to increase or decrease volume.",
            "mejs.unmute": "Unmute",
            "mejs.mute": "Mute",
            "mejs.volume-slider": "Volume Slider",
            "mejs.video-player": "Video Player",
            "mejs.audio-player": "Audio Player",
            "mejs.captions-subtitles": "Captions/Subtitles",
            "mejs.captions-chapters": "Chapters",
            "mejs.none": "None",
            "mejs.afrikaans": "Afrikaans",
            "mejs.albanian": "Albanian",
            "mejs.arabic": "Arabic",
            "mejs.belarusian": "Belarusian",
            "mejs.bulgarian": "Bulgarian",
            "mejs.catalan": "Catalan",
            "mejs.chinese": "Chinese",
            "mejs.chinese-simplified": "Chinese (Simplified)",
            "mejs.chinese-traditional": "Chinese (Traditional)",
            "mejs.croatian": "Croatian",
            "mejs.czech": "Czech",
            "mejs.danish": "Danish",
            "mejs.dutch": "Dutch",
            "mejs.english": "English",
            "mejs.estonian": "Estonian",
            "mejs.filipino": "Filipino",
            "mejs.finnish": "Finnish",
            "mejs.french": "French",
            "mejs.galician": "Galician",
            "mejs.german": "German",
            "mejs.greek": "Greek",
            "mejs.haitian-creole": "Haitian Creole",
            "mejs.hebrew": "Hebrew",
            "mejs.hindi": "Hindi",
            "mejs.hungarian": "Hungarian",
            "mejs.icelandic": "Icelandic",
            "mejs.indonesian": "Indonesian",
            "mejs.irish": "Irish",
            "mejs.italian": "Italian",
            "mejs.japanese": "Japanese",
            "mejs.korean": "Korean",
            "mejs.latvian": "Latvian",
            "mejs.lithuanian": "Lithuanian",
            "mejs.macedonian": "Macedonian",
            "mejs.malay": "Malay",
            "mejs.maltese": "Maltese",
            "mejs.norwegian": "Norwegian",
            "mejs.persian": "Persian",
            "mejs.polish": "Polish",
            "mejs.portuguese": "Portuguese",
            "mejs.romanian": "Romanian",
            "mejs.russian": "Russian",
            "mejs.serbian": "Serbian",
            "mejs.slovak": "Slovak",
            "mejs.slovenian": "Slovenian",
            "mejs.spanish": "Spanish",
            "mejs.swahili": "Swahili",
            "mejs.swedish": "Swedish",
            "mejs.tagalog": "Tagalog",
            "mejs.thai": "Thai",
            "mejs.turkish": "Turkish",
            "mejs.ukrainian": "Ukrainian",
            "mejs.vietnamese": "Vietnamese",
            "mejs.welsh": "Welsh",
            "mejs.yiddish": "Yiddish"
        }
    }
    , {}],
    18: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.config = void 0;
        var i = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , o = function() {
            function o(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var o = t[n];
                    o.enumerable = o.enumerable || !1,
                    o.configurable = !0,
                    "value"in o && (o.writable = !0),
                    Object.defineProperty(e, o.key, o)
                }
            }
            return function(e, t, n) {
                return t && o(e.prototype, t),
                n && o(e, n),
                e
            }
        }()
          , S = r(e(3))
          , w = r(e(2))
          , v = r(e(9))
          , y = r(e(8))
          , a = r(e(19))
          , g = r(e(7))
          , x = e(27)
          , E = e(29)
          , d = e(32)
          , b = e(30)
          , T = function(e) {
            {
                if (e && e.__esModule)
                    return e;
                var t = {};
                if (null != e)
                    for (var n in e)
                        Object.prototype.hasOwnProperty.call(e, n) && (t[n] = e[n]);
                return t.default = e,
                t
            }
        }(e(28));
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        v.default.mepIndex = 0,
        v.default.players = {};
        var s = n.config = {
            poster: "",
            showPosterWhenEnded: !1,
            showPosterWhenPaused: !1,
            defaultVideoWidth: 480,
            defaultVideoHeight: 270,
            videoWidth: -1,
            videoHeight: -1,
            defaultAudioWidth: 400,
            defaultAudioHeight: 40,
            defaultSeekBackwardInterval: function(e) {
                return .05 * e.getDuration()
            },
            defaultSeekForwardInterval: function(e) {
                return .05 * e.getDuration()
            },
            setDimensions: !0,
            audioWidth: -1,
            audioHeight: -1,
            loop: !1,
            autoRewind: !0,
            enableAutosize: !0,
            timeFormat: "",
            alwaysShowHours: !1,
            showTimecodeFrameCount: !1,
            framesPerSecond: 25,
            alwaysShowControls: !1,
            hideVideoControlsOnLoad: !1,
            hideVideoControlsOnPause: !1,
            clickToPlayPause: !0,
            controlsTimeoutDefault: 1500,
            controlsTimeoutMouseEnter: 2500,
            controlsTimeoutMouseLeave: 1e3,
            iPadUseNativeControls: !1,
            iPhoneUseNativeControls: !1,
            AndroidUseNativeControls: !1,
            features: ["playpause", "current", "progress", "duration", "tracks", "volume", "fullscreen"],
            useDefaultControls: !1,
            isVideo: !0,
            stretching: "auto",
            classPrefix: "mejs__",
            enableKeyboard: !0,
            pauseOtherPlayers: !0,
            secondsDecimalLength: 0,
            customError: null,
            keyActions: [{
                keys: [32, 179],
                action: function(e) {
                    x.IS_FIREFOX || (e.paused || e.ended ? e.play() : e.pause())
                }
            }]
        };
        v.default.MepDefaults = s;
        var l = function() {
            function r(e, t) {
                !function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, r);
                var n = this
                  , o = "string" == typeof e ? w.default.getElementById(e) : e;
                if (!(n instanceof r))
                    return new r(o,t);
                if (n.node = n.media = o,
                n.node) {
                    if (n.media.player)
                        return n.media.player;
                    if (n.hasFocus = !1,
                    n.controlsAreVisible = !0,
                    n.controlsEnabled = !0,
                    n.controlsTimer = null,
                    n.currentMediaTime = 0,
                    n.proxy = null,
                    void 0 === t) {
                        var i = n.node.getAttribute("data-mejsoptions");
                        t = i ? JSON.parse(i) : {}
                    }
                    return n.options = Object.assign({}, s, t),
                    n.options.loop && !n.media.getAttribute("loop") ? (n.media.loop = !0,
                    n.node.loop = !0) : n.media.loop && (n.options.loop = !0),
                    n.options.timeFormat || (n.options.timeFormat = "mm:ss",
                    n.options.alwaysShowHours && (n.options.timeFormat = "hh:mm:ss"),
                    n.options.showTimecodeFrameCount && (n.options.timeFormat += ":ff")),
                    (0,
                    d.calculateTimeFormat)(0, n.options, n.options.framesPerSecond || 25),
                    n.id = "mep_" + v.default.mepIndex++,
                    (v.default.players[n.id] = n).init(),
                    n
                }
            }
            return o(r, [{
                key: "getElement",
                value: function(e) {
                    return e
                }
            }, {
                key: "init",
                value: function() {
                    var n = this
                      , e = Object.assign({}, n.options, {
                        success: function(e, t) {
                            n._meReady(e, t)
                        },
                        error: function(e) {
                            n._handleError(e)
                        }
                    })
                      , t = n.node.tagName.toLowerCase();
                    if (n.isDynamic = "audio" !== t && "video" !== t && "iframe" !== t,
                    n.isVideo = n.isDynamic ? n.options.isVideo : "audio" !== t && n.options.isVideo,
                    n.mediaFiles = null,
                    n.trackFiles = null,
                    x.IS_IPAD && n.options.iPadUseNativeControls || x.IS_IPHONE && n.options.iPhoneUseNativeControls)
                        n.node.setAttribute("controls", !0),
                        x.IS_IPAD && n.node.getAttribute("autoplay") && n.play();
                    else if (!n.isVideo && (n.isVideo || !n.options.features.length && !n.options.useDefaultControls) || x.IS_ANDROID && n.options.AndroidUseNativeControls)
                        n.isVideo || n.options.features.length || n.options.useDefaultControls || (n.node.style.display = "none");
                    else {
                        n.node.removeAttribute("controls");
                        var o = n.isVideo ? g.default.t("mejs.video-player") : g.default.t("mejs.audio-player")
                          , i = w.default.createElement("span");
                        if (i.className = n.options.classPrefix + "offscreen",
                        i.innerText = o,
                        n.media.parentNode.insertBefore(i, n.media),
                        n.container = w.default.createElement("div"),
                        n.getElement(n.container).id = n.id,
                        n.getElement(n.container).className = n.options.classPrefix + "container " + n.options.classPrefix + "container-keyboard-inactive " + n.media.className,
                        n.getElement(n.container).tabIndex = 0,
                        n.getElement(n.container).setAttribute("role", "application"),
                        n.getElement(n.container).setAttribute("aria-label", o),
                        n.getElement(n.container).innerHTML = '<div class="' + n.options.classPrefix + 'inner"><div class="' + n.options.classPrefix + 'mediaelement"></div><div class="' + n.options.classPrefix + 'layers"></div><div class="' + n.options.classPrefix + 'controls"></div></div>',
                        n.getElement(n.container).addEventListener("focus", function(e) {
                            if (!n.controlsAreVisible && !n.hasFocus && n.controlsEnabled) {
                                n.showControls(!0);
                                var t = (0,
                                E.isNodeAfter)(e.relatedTarget, n.getElement(n.container)) ? "." + n.options.classPrefix + "controls ." + n.options.classPrefix + "button:last-child > button" : "." + n.options.classPrefix + "playpause-button > button";
                                n.getElement(n.container).querySelector(t).focus()
                            }
                        }),
                        n.node.parentNode.insertBefore(n.getElement(n.container), n.node),
                        n.options.features.length || n.options.useDefaultControls || (n.getElement(n.container).style.background = "transparent",
                        n.getElement(n.container).querySelector("." + n.options.classPrefix + "controls").style.display = "none"),
                        n.isVideo && "fill" === n.options.stretching && !T.hasClass(n.getElement(n.container).parentNode, n.options.classPrefix + "fill-container")) {
                            n.outerContainer = n.media.parentNode;
                            var r = w.default.createElement("div");
                            r.className = n.options.classPrefix + "fill-container",
                            n.getElement(n.container).parentNode.insertBefore(r, n.getElement(n.container)),
                            r.appendChild(n.getElement(n.container))
                        }
                        if (x.IS_ANDROID && T.addClass(n.getElement(n.container), n.options.classPrefix + "android"),
                        x.IS_IOS && T.addClass(n.getElement(n.container), n.options.classPrefix + "ios"),
                        x.IS_IPAD && T.addClass(n.getElement(n.container), n.options.classPrefix + "ipad"),
                        x.IS_IPHONE && T.addClass(n.getElement(n.container), n.options.classPrefix + "iphone"),
                        T.addClass(n.getElement(n.container), n.isVideo ? n.options.classPrefix + "video" : n.options.classPrefix + "audio"),
                        x.IS_SAFARI && !x.IS_IOS) {
                            T.addClass(n.getElement(n.container), n.options.classPrefix + "hide-cues");
                            for (var a = n.node.cloneNode(), s = n.node.children, l = [], d = [], u = 0, c = s.length; u < c; u++) {
                                var f = s[u];
                                !function() {
                                    switch (f.tagName.toLowerCase()) {
                                    case "source":
                                        var t = {};
                                        Array.prototype.slice.call(f.attributes).forEach(function(e) {
                                            t[e.name] = e.value
                                        }),
                                        t.type = (0,
                                        b.formatType)(t.src, t.type),
                                        l.push(t);
                                        break;
                                    case "track":
                                        f.mode = "hidden",
                                        d.push(f);
                                        break;
                                    default:
                                        a.appendChild(f.cloneNode(!0))
                                    }
                                }()
                            }
                            n.node.remove(),
                            n.node = n.media = a,
                            l.length && (n.mediaFiles = l),
                            d.length && (n.trackFiles = d)
                        }
                        n.getElement(n.container).querySelector("." + n.options.classPrefix + "mediaelement").appendChild(n.node),
                        (n.media.player = n).controls = n.getElement(n.container).querySelector("." + n.options.classPrefix + "controls"),
                        n.layers = n.getElement(n.container).querySelector("." + n.options.classPrefix + "layers");
                        var p = n.isVideo ? "video" : "audio"
                          , m = p.substring(0, 1).toUpperCase() + p.substring(1);
                        0 < n.options[p + "Width"] || -1 < n.options[p + "Width"].toString().indexOf("%") ? n.width = n.options[p + "Width"] : "" !== n.node.style.width && null !== n.node.style.width ? n.width = n.node.style.width : n.node.getAttribute("width") ? n.width = n.node.getAttribute("width") : n.width = n.options["default" + m + "Width"],
                        0 < n.options[p + "Height"] || -1 < n.options[p + "Height"].toString().indexOf("%") ? n.height = n.options[p + "Height"] : "" !== n.node.style.height && null !== n.node.style.height ? n.height = n.node.style.height : n.node.getAttribute("height") ? n.height = n.node.getAttribute("height") : n.height = n.options["default" + m + "Height"],
                        n.initialAspectRatio = n.height >= n.width ? n.width / n.height : n.height / n.width,
                        n.setPlayerSize(n.width, n.height),
                        e.pluginWidth = n.width,
                        e.pluginHeight = n.height
                    }
                    if (v.default.MepDefaults = e,
                    new y.default(n.media,e,n.mediaFiles),
                    void 0 !== n.getElement(n.container) && n.options.features.length && n.controlsAreVisible && !n.options.hideVideoControlsOnLoad) {
                        var h = (0,
                        E.createEvent)("controlsshown", n.getElement(n.container));
                        n.getElement(n.container).dispatchEvent(h)
                    }
                }
            }, {
                key: "showControls",
                value: function(e) {
                    var i = this;
                    if (e = void 0 === e || e,
                    !i.controlsAreVisible && i.isVideo) {
                        if (e)
                            !function() {
                                T.fadeIn(i.getElement(i.controls), 200, function() {
                                    T.removeClass(i.getElement(i.controls), i.options.classPrefix + "offscreen");
                                    var e = (0,
                                    E.createEvent)("controlsshown", i.getElement(i.container));
                                    i.getElement(i.container).dispatchEvent(e)
                                });
                                for (var n = i.getElement(i.container).querySelectorAll("." + i.options.classPrefix + "control"), e = function(e, t) {
                                    T.fadeIn(n[e], 200, function() {
                                        T.removeClass(n[e], i.options.classPrefix + "offscreen")
                                    })
                                }, t = 0, o = n.length; t < o; t++)
                                    e(t)
                            }();
                        else {
                            T.removeClass(i.getElement(i.controls), i.options.classPrefix + "offscreen"),
                            i.getElement(i.controls).style.display = "",
                            i.getElement(i.controls).style.opacity = 1;
                            for (var t = i.getElement(i.container).querySelectorAll("." + i.options.classPrefix + "control"), n = 0, o = t.length; n < o; n++)
                                T.removeClass(t[n], i.options.classPrefix + "offscreen"),
                                t[n].style.display = "";
                            var r = (0,
                            E.createEvent)("controlsshown", i.getElement(i.container));
                            i.getElement(i.container).dispatchEvent(r)
                        }
                        i.controlsAreVisible = !0,
                        i.setControlsSize()
                    }
                }
            }, {
                key: "hideControls",
                value: function(e, t) {
                    var i = this;
                    if (e = void 0 === e || e,
                    !0 === t || !(!i.controlsAreVisible || i.options.alwaysShowControls || i.paused && 4 === i.readyState && (!i.options.hideVideoControlsOnLoad && i.currentTime <= 0 || !i.options.hideVideoControlsOnPause && 0 < i.currentTime) || i.isVideo && !i.options.hideVideoControlsOnLoad && !i.readyState || i.ended)) {
                        if (e)
                            !function() {
                                T.fadeOut(i.getElement(i.controls), 200, function() {
                                    T.addClass(i.getElement(i.controls), i.options.classPrefix + "offscreen"),
                                    i.getElement(i.controls).style.display = "";
                                    var e = (0,
                                    E.createEvent)("controlshidden", i.getElement(i.container));
                                    i.getElement(i.container).dispatchEvent(e)
                                });
                                for (var n = i.getElement(i.container).querySelectorAll("." + i.options.classPrefix + "control"), e = function(e, t) {
                                    T.fadeOut(n[e], 200, function() {
                                        T.addClass(n[e], i.options.classPrefix + "offscreen"),
                                        n[e].style.display = ""
                                    })
                                }, t = 0, o = n.length; t < o; t++)
                                    e(t)
                            }();
                        else {
                            T.addClass(i.getElement(i.controls), i.options.classPrefix + "offscreen"),
                            i.getElement(i.controls).style.display = "",
                            i.getElement(i.controls).style.opacity = 0;
                            for (var n = i.getElement(i.container).querySelectorAll("." + i.options.classPrefix + "control"), o = 0, r = n.length; o < r; o++)
                                T.addClass(n[o], i.options.classPrefix + "offscreen"),
                                n[o].style.display = "";
                            var a = (0,
                            E.createEvent)("controlshidden", i.getElement(i.container));
                            i.getElement(i.container).dispatchEvent(a)
                        }
                        i.controlsAreVisible = !1
                    }
                }
            }, {
                key: "startControlsTimer",
                value: function(e) {
                    var t = this;
                    e = void 0 !== e ? e : t.options.controlsTimeoutDefault,
                    t.killControlsTimer("start"),
                    t.controlsTimer = setTimeout(function() {
                        t.hideControls(),
                        t.killControlsTimer("hide")
                    }, e)
                }
            }, {
                key: "killControlsTimer",
                value: function() {
                    null !== this.controlsTimer && (clearTimeout(this.controlsTimer),
                    delete this.controlsTimer,
                    this.controlsTimer = null)
                }
            }, {
                key: "disableControls",
                value: function() {
                    this.killControlsTimer(),
                    this.controlsEnabled = !1,
                    this.hideControls(!1, !0)
                }
            }, {
                key: "enableControls",
                value: function() {
                    this.controlsEnabled = !0,
                    this.showControls(!1)
                }
            }, {
                key: "_setDefaultPlayer",
                value: function() {
                    var e = this;
                    e.proxy && e.proxy.pause(),
                    e.proxy = new a.default(e),
                    e.media.addEventListener("loadedmetadata", function() {
                        0 < e.getCurrentTime() && 0 < e.currentMediaTime && (e.setCurrentTime(e.currentMediaTime),
                        x.IS_IOS || x.IS_ANDROID || e.play())
                    })
                }
            }, {
                key: "_meReady",
                value: function(e, t) {
                    var n = this
                      , o = t.getAttribute("autoplay")
                      , i = !(null == o || "false" === o)
                      , r = null !== e.rendererName && /(native|html5)/i.test(n.media.rendererName);
                    if (n.getElement(n.controls) && n.enableControls(),
                    n.getElement(n.container) && n.getElement(n.container).querySelector("." + n.options.classPrefix + "overlay-play") && (n.getElement(n.container).querySelector("." + n.options.classPrefix + "overlay-play").style.display = ""),
                    !n.created) {
                        if (n.created = !0,
                        n.media = e,
                        n.domNode = t,
                        !(x.IS_ANDROID && n.options.AndroidUseNativeControls || x.IS_IPAD && n.options.iPadUseNativeControls || x.IS_IPHONE && n.options.iPhoneUseNativeControls)) {
                            if (!n.isVideo && !n.options.features.length && !n.options.useDefaultControls)
                                return i && r && n.play(),
                                void (n.options.success && ("string" == typeof n.options.success ? S.default[n.options.success](n.media, n.domNode, n) : n.options.success(n.media, n.domNode, n)));
                            if (n.featurePosition = {},
                            n._setDefaultPlayer(),
                            n.buildposter(n, n.getElement(n.controls), n.getElement(n.layers), n.media),
                            n.buildkeyboard(n, n.getElement(n.controls), n.getElement(n.layers), n.media),
                            n.buildoverlays(n, n.getElement(n.controls), n.getElement(n.layers), n.media),
                            n.options.useDefaultControls) {
                                var a = ["playpause", "current", "progress", "duration", "tracks", "volume", "fullscreen"];
                                n.options.features = a.concat(n.options.features.filter(function(e) {
                                    return -1 === a.indexOf(e)
                                }))
                            }
                            n.buildfeatures(n, n.getElement(n.controls), n.getElement(n.layers), n.media);
                            var s = (0,
                            E.createEvent)("controlsready", n.getElement(n.container));
                            n.getElement(n.container).dispatchEvent(s),
                            n.setPlayerSize(n.width, n.height),
                            n.setControlsSize(),
                            n.isVideo && (n.clickToPlayPauseCallback = function() {
                                if (n.options.clickToPlayPause) {
                                    var e = n.getElement(n.container).querySelector("." + n.options.classPrefix + "overlay-button")
                                      , t = e.getAttribute("aria-pressed");
                                    n.paused && t ? n.pause() : n.paused ? n.play() : n.pause(),
                                    e.setAttribute("aria-pressed", !t),
                                    n.getElement(n.container).focus()
                                }
                            }
                            ,
                            n.createIframeLayer(),
                            n.media.addEventListener("click", n.clickToPlayPauseCallback),
                            !x.IS_ANDROID && !x.IS_IOS || n.options.alwaysShowControls ? (n.getElement(n.container).addEventListener("mouseenter", function() {
                                n.controlsEnabled && (n.options.alwaysShowControls || (n.killControlsTimer("enter"),
                                n.showControls(),
                                n.startControlsTimer(n.options.controlsTimeoutMouseEnter)))
                            }),
                            n.getElement(n.container).addEventListener("mousemove", function() {
                                n.controlsEnabled && (n.controlsAreVisible || n.showControls(),
                                n.options.alwaysShowControls || n.startControlsTimer(n.options.controlsTimeoutMouseEnter))
                            }),
                            n.getElement(n.container).addEventListener("mouseleave", function() {
                                n.controlsEnabled && (n.paused || n.options.alwaysShowControls || n.startControlsTimer(n.options.controlsTimeoutMouseLeave))
                            })) : n.node.addEventListener("touchstart", function() {
                                n.controlsAreVisible ? n.hideControls(!1) : n.controlsEnabled && n.showControls(!1)
                            }, !!x.SUPPORT_PASSIVE_EVENT && {
                                passive: !0
                            }),
                            n.options.hideVideoControlsOnLoad && n.hideControls(!1),
                            n.options.enableAutosize && n.media.addEventListener("loadedmetadata", function(e) {
                                var t = void 0 !== e ? e.detail.target || e.target : n.media;
                                n.options.videoHeight <= 0 && !n.domNode.getAttribute("height") && !n.domNode.style.height && null !== t && !isNaN(t.videoHeight) && (n.setPlayerSize(t.videoWidth, t.videoHeight),
                                n.setControlsSize(),
                                n.media.setSize(t.videoWidth, t.videoHeight))
                            })),
                            n.media.addEventListener("play", function() {
                                for (var e in n.hasFocus = !0,
                                v.default.players)
                                    if (v.default.players.hasOwnProperty(e)) {
                                        var t = v.default.players[e];
                                        t.id === n.id || !n.options.pauseOtherPlayers || t.paused || t.ended || (t.pause(),
                                        t.hasFocus = !1)
                                    }
                                x.IS_ANDROID || x.IS_IOS || n.options.alwaysShowControls || !n.isVideo || n.hideControls()
                            }),
                            n.media.addEventListener("ended", function() {
                                if (n.options.autoRewind)
                                    try {
                                        n.setCurrentTime(0),
                                        setTimeout(function() {
                                            var e = n.getElement(n.container).querySelector("." + n.options.classPrefix + "overlay-loading");
                                            e && e.parentNode && (e.parentNode.style.display = "none")
                                        }, 20)
                                    } catch (e) {}
                                "function" == typeof n.media.renderer.stop ? n.media.renderer.stop() : n.pause(),
                                n.setProgressRail && n.setProgressRail(),
                                n.setCurrentRail && n.setCurrentRail(),
                                n.options.loop ? n.play() : !n.options.alwaysShowControls && n.controlsEnabled && n.showControls()
                            }),
                            n.media.addEventListener("loadedmetadata", function() {
                                (0,
                                d.calculateTimeFormat)(n.getDuration(), n.options, n.options.framesPerSecond || 25),
                                n.updateDuration && n.updateDuration(),
                                n.updateCurrent && n.updateCurrent(),
                                n.isFullScreen || (n.setPlayerSize(n.width, n.height),
                                n.setControlsSize())
                            });
                            var l = null;
                            n.media.addEventListener("timeupdate", function() {
                                isNaN(n.getDuration()) || l === n.getDuration() || (l = n.getDuration(),
                                (0,
                                d.calculateTimeFormat)(l, n.options, n.options.framesPerSecond || 25),
                                n.updateDuration && n.updateDuration(),
                                n.updateCurrent && n.updateCurrent(),
                                n.setControlsSize())
                            }),
                            n.getElement(n.container).addEventListener("click", function(e) {
                                T.addClass(e.currentTarget, n.options.classPrefix + "container-keyboard-inactive")
                            }),
                            n.getElement(n.container).addEventListener("focusin", function(e) {
                                T.removeClass(e.currentTarget, n.options.classPrefix + "container-keyboard-inactive"),
                                !n.isVideo || x.IS_ANDROID || x.IS_IOS || !n.controlsEnabled || n.options.alwaysShowControls || (n.killControlsTimer("enter"),
                                n.showControls(),
                                n.startControlsTimer(n.options.controlsTimeoutMouseEnter))
                            }),
                            n.getElement(n.container).addEventListener("focusout", function(e) {
                                setTimeout(function() {
                                    e.relatedTarget && n.keyboardAction && !e.relatedTarget.closest("." + n.options.classPrefix + "container") && (n.keyboardAction = !1,
                                    !n.isVideo || n.options.alwaysShowControls || n.paused || n.startControlsTimer(n.options.controlsTimeoutMouseLeave))
                                }, 0)
                            }),
                            setTimeout(function() {
                                n.setPlayerSize(n.width, n.height),
                                n.setControlsSize()
                            }, 0),
                            n.globalResizeCallback = function() {
                                n.isFullScreen || x.HAS_TRUE_NATIVE_FULLSCREEN && w.default.webkitIsFullScreen || n.setPlayerSize(n.width, n.height),
                                n.setControlsSize()
                            }
                            ,
                            n.globalBind("resize", n.globalResizeCallback)
                        }
                        i && r && n.play(),
                        n.options.success && ("string" == typeof n.options.success ? S.default[n.options.success](n.media, n.domNode, n) : n.options.success(n.media, n.domNode, n))
                    }
                }
            }, {
                key: "_handleError",
                value: function(e, t, n) {
                    var o = this
                      , i = o.getElement(o.layers).querySelector("." + o.options.classPrefix + "overlay-play");
                    i && (i.style.display = "none"),
                    o.options.error && o.options.error(e, t, n),
                    o.getElement(o.container).querySelector("." + o.options.classPrefix + "cannotplay") && o.getElement(o.container).querySelector("." + o.options.classPrefix + "cannotplay").remove();
                    var r = w.default.createElement("div");
                    r.className = o.options.classPrefix + "cannotplay",
                    r.style.width = "100%",
                    r.style.height = "100%";
                    var a = "function" == typeof o.options.customError ? o.options.customError(o.media, o.media.originalNode) : o.options.customError
                      , s = "";
                    if (!a) {
                        var l = o.media.originalNode.getAttribute("poster");
                        if (l && (s = '<img src="' + l + '" alt="' + v.default.i18n.t("mejs.download-file") + '">'),
                        e.message && (a = "<p>" + e.message + "</p>"),
                        e.urls)
                            for (var d = 0, u = e.urls.length; d < u; d++) {
                                var c = e.urls[d];
                                a += '<a href="' + c.src + '" data-type="' + c.type + '"><span>' + v.default.i18n.t("mejs.download-file") + ": " + c.src + "</span></a>"
                            }
                    }
                    a && o.getElement(o.layers).querySelector("." + o.options.classPrefix + "overlay-error") && (r.innerHTML = a,
                    o.getElement(o.layers).querySelector("." + o.options.classPrefix + "overlay-error").innerHTML = "" + s + r.outerHTML,
                    o.getElement(o.layers).querySelector("." + o.options.classPrefix + "overlay-error").parentNode.style.display = "block"),
                    o.controlsEnabled && o.disableControls()
                }
            }, {
                key: "setPlayerSize",
                value: function(e, t) {
                    var n = this;
                    if (!n.options.setDimensions)
                        return !1;
                    switch (void 0 !== e && (n.width = e),
                    void 0 !== t && (n.height = t),
                    n.options.stretching) {
                    case "fill":
                        n.isVideo ? n.setFillMode() : n.setDimensions(n.width, n.height);
                        break;
                    case "responsive":
                        n.setResponsiveMode();
                        break;
                    case "none":
                        n.setDimensions(n.width, n.height);
                        break;
                    default:
                        !0 === n.hasFluidMode() ? n.setResponsiveMode() : n.setDimensions(n.width, n.height)
                    }
                }
            }, {
                key: "hasFluidMode",
                value: function() {
                    var e = this;
                    return -1 !== e.height.toString().indexOf("%") || e.node && e.node.style.maxWidth && "none" !== e.node.style.maxWidth && e.node.style.maxWidth !== e.width || e.node && e.node.currentStyle && "100%" === e.node.currentStyle.maxWidth
                }
            }, {
                key: "setResponsiveMode",
                value: function() {
                    var e, o = this, t = function() {
                        for (var t = void 0, n = o.getElement(o.container); n; ) {
                            try {
                                if (x.IS_FIREFOX && "html" === n.tagName.toLowerCase() && S.default.self !== S.default.top && null !== S.default.frameElement)
                                    return S.default.frameElement;
                                t = n.parentElement
                            } catch (e) {
                                t = n.parentElement
                            }
                            if (t && T.visible(t))
                                return t;
                            n = t
                        }
                        return null
                    }(), n = t ? getComputedStyle(t, null) : getComputedStyle(w.default.body, null), i = o.isVideo ? o.node.videoWidth && 0 < o.node.videoWidth ? o.node.videoWidth : o.node.getAttribute("width") ? o.node.getAttribute("width") : o.options.defaultVideoWidth : o.options.defaultAudioWidth, r = o.isVideo ? o.node.videoHeight && 0 < o.node.videoHeight ? o.node.videoHeight : o.node.getAttribute("height") ? o.node.getAttribute("height") : o.options.defaultVideoHeight : o.options.defaultAudioHeight, a = (e = 1,
                    o.isVideo && (e = o.node.videoWidth && 0 < o.node.videoWidth && o.node.videoHeight && 0 < o.node.videoHeight ? o.height >= o.width ? o.node.videoWidth / o.node.videoHeight : o.node.videoHeight / o.node.videoWidth : o.initialAspectRatio,
                    (isNaN(e) || e < .01 || 100 < e) && (e = 1)),
                    e), s = parseFloat(n.height), l = void 0, d = parseFloat(n.width);
                    if (l = o.isVideo ? "100%" === o.height ? parseFloat(d * r / i, 10) : o.height >= o.width ? parseFloat(d / a, 10) : parseFloat(d * a, 10) : r,
                    isNaN(l) && (l = s),
                    0 < o.getElement(o.container).parentNode.length && "body" === o.getElement(o.container).parentNode.tagName.toLowerCase() && (d = S.default.innerWidth || w.default.documentElement.clientWidth || w.default.body.clientWidth,
                    l = S.default.innerHeight || w.default.documentElement.clientHeight || w.default.body.clientHeight),
                    l && d) {
                        o.getElement(o.container).style.width = d + "px",
                        o.getElement(o.container).style.height = l + "px",
                        o.node.style.width = "100%",
                        o.node.style.height = "100%",
                        o.isVideo && o.media.setSize && o.media.setSize(d, l);
                        for (var u = o.getElement(o.layers).children, c = 0, f = u.length; c < f; c++)
                            u[c].style.width = "100%",
                            u[c].style.height = "100%"
                    }
                }
            }, {
                key: "setFillMode",
                value: function() {
                    var e = this
                      , t = S.default.self !== S.default.top && null !== S.default.frameElement
                      , n = function() {
                        for (var t = void 0, n = e.getElement(e.container); n; ) {
                            try {
                                if (x.IS_FIREFOX && "html" === n.tagName.toLowerCase() && S.default.self !== S.default.top && null !== S.default.frameElement)
                                    return S.default.frameElement;
                                t = n.parentElement
                            } catch (e) {
                                t = n.parentElement
                            }
                            if (t && T.visible(t))
                                return t;
                            n = t
                        }
                        return null
                    }()
                      , o = n ? getComputedStyle(n, null) : getComputedStyle(w.default.body, null);
                    "none" !== e.node.style.height && e.node.style.height !== e.height && (e.node.style.height = "auto"),
                    "none" !== e.node.style.maxWidth && e.node.style.maxWidth !== e.width && (e.node.style.maxWidth = "none"),
                    "none" !== e.node.style.maxHeight && e.node.style.maxHeight !== e.height && (e.node.style.maxHeight = "none"),
                    e.node.currentStyle && ("100%" === e.node.currentStyle.height && (e.node.currentStyle.height = "auto"),
                    "100%" === e.node.currentStyle.maxWidth && (e.node.currentStyle.maxWidth = "none"),
                    "100%" === e.node.currentStyle.maxHeight && (e.node.currentStyle.maxHeight = "none")),
                    t || parseFloat(o.width) || (n.style.width = e.media.offsetWidth + "px"),
                    t || parseFloat(o.height) || (n.style.height = e.media.offsetHeight + "px"),
                    o = getComputedStyle(n);
                    var i = parseFloat(o.width)
                      , r = parseFloat(o.height);
                    e.setDimensions("100%", "100%");
                    var a = e.getElement(e.container).querySelector("." + e.options.classPrefix + "poster>img");
                    a && (a.style.display = "");
                    for (var s = e.getElement(e.container).querySelectorAll("object, embed, iframe, video"), l = e.height, d = e.width, u = i, c = l * i / d, f = d * r / l, p = r, m = i < f == !1, h = m ? Math.floor(u) : Math.floor(f), v = m ? Math.floor(c) : Math.floor(p), y = m ? i + "px" : h + "px", g = m ? v + "px" : r + "px", E = 0, b = s.length; E < b; E++)
                        s[E].style.height = g,
                        s[E].style.width = y,
                        e.media.setSize && e.media.setSize(y, g),
                        s[E].style.marginLeft = Math.floor((i - h) / 2) + "px",
                        s[E].style.marginTop = 0
                }
            }, {
                key: "setDimensions",
                value: function(e, t) {
                    var n = this;
                    e = (0,
                    E.isString)(e) && -1 < e.indexOf("%") ? e : parseFloat(e) + "px",
                    t = (0,
                    E.isString)(t) && -1 < t.indexOf("%") ? t : parseFloat(t) + "px",
                    n.getElement(n.container).style.width = e,
                    n.getElement(n.container).style.height = t;
                    for (var o = n.getElement(n.layers).children, i = 0, r = o.length; i < r; i++)
                        o[i].style.width = e,
                        o[i].style.height = t
                }
            }, {
                key: "setControlsSize",
                value: function() {
                    var t = this;
                    if (T.visible(t.getElement(t.container)))
                        if (t.rail && T.visible(t.rail)) {
                            for (var e = t.total ? getComputedStyle(t.total, null) : null, n = e ? parseFloat(e.marginLeft) + parseFloat(e.marginRight) : 0, o = getComputedStyle(t.rail), i = parseFloat(o.marginLeft) + parseFloat(o.marginRight), r = 0, a = T.siblings(t.rail, function(e) {
                                return e !== t.rail
                            }), s = a.length, l = 0; l < s; l++)
                                r += a[l].offsetWidth;
                            r += n + (0 === n ? 2 * i : i) + 1,
                            t.getElement(t.container).style.minWidth = r + "px";
                            var d = (0,
                            E.createEvent)("controlsresize", t.getElement(t.container));
                            t.getElement(t.container).dispatchEvent(d)
                        } else {
                            for (var u = t.getElement(t.controls).children, c = 0, f = 0, p = u.length; f < p; f++)
                                c += u[f].offsetWidth;
                            t.getElement(t.container).style.minWidth = c + "px"
                        }
                }
            }, {
                key: "addControlElement",
                value: function(e, t) {
                    var n = this;
                    if (void 0 !== n.featurePosition[t]) {
                        var o = n.getElement(n.controls).children[n.featurePosition[t] - 1];
                        o.parentNode.insertBefore(e, o.nextSibling)
                    } else {
                        n.getElement(n.controls).appendChild(e);
                        for (var i = n.getElement(n.controls).children, r = 0, a = i.length; r < a; r++)
                            if (e === i[r]) {
                                n.featurePosition[t] = r;
                                break
                            }
                    }
                }
            }, {
                key: "createIframeLayer",
                value: function() {
                    var t = this;
                    if (t.isVideo && null !== t.media.rendererName && -1 < t.media.rendererName.indexOf("iframe") && !w.default.getElementById(t.media.id + "-iframe-overlay")) {
                        var e = w.default.createElement("div")
                          , n = w.default.getElementById(t.media.id + "_" + t.media.rendererName);
                        e.id = t.media.id + "-iframe-overlay",
                        e.className = t.options.classPrefix + "iframe-overlay",
                        e.addEventListener("click", function(e) {
                            t.options.clickToPlayPause && (t.paused ? t.play() : t.pause(),
                            e.preventDefault(),
                            e.stopPropagation())
                        }),
                        n.parentNode.insertBefore(e, n)
                    }
                }
            }, {
                key: "resetSize",
                value: function() {
                    var e = this;
                    setTimeout(function() {
                        e.setPlayerSize(e.width, e.height),
                        e.setControlsSize()
                    }, 50)
                }
            }, {
                key: "setPoster",
                value: function(e) {
                    var t = this;
                    if (t.getElement(t.container)) {
                        var n = t.getElement(t.container).querySelector("." + t.options.classPrefix + "poster");
                        n || ((n = w.default.createElement("div")).className = t.options.classPrefix + "poster " + t.options.classPrefix + "layer",
                        t.getElement(t.layers).appendChild(n));
                        var o = n.querySelector("img");
                        !o && e && ((o = w.default.createElement("img")).className = t.options.classPrefix + "poster-img",
                        o.width = "100%",
                        o.height = "100%",
                        n.style.display = "",
                        n.appendChild(o)),
                        e ? (o.setAttribute("src", e),
                        n.style.backgroundImage = 'url("' + e + '")',
                        n.style.display = "") : o ? (n.style.backgroundImage = "none",
                        n.style.display = "none",
                        o.remove()) : n.style.display = "none"
                    } else
                        (x.IS_IPAD && t.options.iPadUseNativeControls || x.IS_IPHONE && t.options.iPhoneUseNativeControls || x.IS_ANDROID && t.options.AndroidUseNativeControls) && (t.media.originalNode.poster = e)
                }
            }, {
                key: "changeSkin",
                value: function(e) {
                    var t = this;
                    t.getElement(t.container).className = t.options.classPrefix + "container " + e,
                    t.setPlayerSize(t.width, t.height),
                    t.setControlsSize()
                }
            }, {
                key: "globalBind",
                value: function(e, n) {
                    var o = this.node ? this.node.ownerDocument : w.default;
                    if ((e = (0,
                    E.splitEvents)(e, this.id)).d)
                        for (var t = e.d.split(" "), i = 0, r = t.length; i < r; i++)
                            t[i].split(".").reduce(function(e, t) {
                                return o.addEventListener(t, n, !1),
                                t
                            }, "");
                    if (e.w)
                        for (var a = e.w.split(" "), s = 0, l = a.length; s < l; s++)
                            a[s].split(".").reduce(function(e, t) {
                                return S.default.addEventListener(t, n, !1),
                                t
                            }, "")
                }
            }, {
                key: "globalUnbind",
                value: function(e, n) {
                    var o = this.node ? this.node.ownerDocument : w.default;
                    if ((e = (0,
                    E.splitEvents)(e, this.id)).d)
                        for (var t = e.d.split(" "), i = 0, r = t.length; i < r; i++)
                            t[i].split(".").reduce(function(e, t) {
                                return o.removeEventListener(t, n, !1),
                                t
                            }, "");
                    if (e.w)
                        for (var a = e.w.split(" "), s = 0, l = a.length; s < l; s++)
                            a[s].split(".").reduce(function(e, t) {
                                return S.default.removeEventListener(t, n, !1),
                                t
                            }, "")
                }
            }, {
                key: "buildfeatures",
                value: function(e, t, n, o) {
                    for (var i = 0, r = this.options.features.length; i < r; i++) {
                        var a = this.options.features[i];
                        if (this["build" + a])
                            try {
                                this["build" + a](e, t, n, o)
                            } catch (e) {
                                console.error("error building " + a, e)
                            }
                    }
                }
            }, {
                key: "buildposter",
                value: function(e, t, n, o) {
                    var i = this
                      , r = w.default.createElement("div");
                    r.className = i.options.classPrefix + "poster " + i.options.classPrefix + "layer",
                    n.appendChild(r);
                    var a = o.originalNode.getAttribute("poster");
                    "" !== e.options.poster && (a && x.IS_IOS && o.originalNode.removeAttribute("poster"),
                    a = e.options.poster),
                    a ? i.setPoster(a) : null !== i.media.renderer && "function" == typeof i.media.renderer.getPosterUrl ? i.setPoster(i.media.renderer.getPosterUrl()) : r.style.display = "none",
                    o.addEventListener("play", function() {
                        r.style.display = "none"
                    }),
                    o.addEventListener("playing", function() {
                        r.style.display = "none"
                    }),
                    e.options.showPosterWhenEnded && e.options.autoRewind && o.addEventListener("ended", function() {
                        r.style.display = ""
                    }),
                    o.addEventListener("error", function() {
                        r.style.display = "none"
                    }),
                    e.options.showPosterWhenPaused && o.addEventListener("pause", function() {
                        e.ended || (r.style.display = "")
                    })
                }
            }, {
                key: "buildoverlays",
                value: function(t, e, n, o) {
                    if (t.isVideo) {
                        var i = this
                          , r = w.default.createElement("div")
                          , a = w.default.createElement("div")
                          , s = w.default.createElement("div");
                        r.style.display = "none",
                        r.className = i.options.classPrefix + "overlay " + i.options.classPrefix + "layer",
                        r.innerHTML = '<div class="' + i.options.classPrefix + 'overlay-loading"><span class="' + i.options.classPrefix + 'overlay-loading-bg-img"></span></div>',
                        n.appendChild(r),
                        a.style.display = "none",
                        a.className = i.options.classPrefix + "overlay " + i.options.classPrefix + "layer",
                        a.innerHTML = '<div class="' + i.options.classPrefix + 'overlay-error"></div>',
                        n.appendChild(a),
                        s.className = i.options.classPrefix + "overlay " + i.options.classPrefix + "layer " + i.options.classPrefix + "overlay-play",
                        s.innerHTML = '<div class="' + i.options.classPrefix + 'overlay-button" role="button" tabindex="0" aria-label="' + g.default.t("mejs.play") + '" aria-pressed="false"></div>',
                        s.addEventListener("click", function() {
                            if (i.options.clickToPlayPause) {
                                var e = i.getElement(i.container).querySelector("." + i.options.classPrefix + "overlay-button")
                                  , t = e.getAttribute("aria-pressed");
                                i.paused ? i.play() : i.pause(),
                                e.setAttribute("aria-pressed", !!t),
                                i.getElement(i.container).focus()
                            }
                        }),
                        s.addEventListener("keydown", function(e) {
                            var t = e.keyCode || e.which || 0;
                            if (13 === t || x.IS_FIREFOX && 32 === t) {
                                var n = (0,
                                E.createEvent)("click", s);
                                return s.dispatchEvent(n),
                                !1
                            }
                        }),
                        n.appendChild(s),
                        null !== i.media.rendererName && (/(youtube|facebook)/i.test(i.media.rendererName) && !(i.media.originalNode.getAttribute("poster") || t.options.poster || "function" == typeof i.media.renderer.getPosterUrl && i.media.renderer.getPosterUrl()) || x.IS_STOCK_ANDROID || i.media.originalNode.getAttribute("autoplay")) && (s.style.display = "none");
                        var l = !1;
                        o.addEventListener("play", function() {
                            s.style.display = "none",
                            r.style.display = "none",
                            a.style.display = "none",
                            l = !1
                        }),
                        o.addEventListener("playing", function() {
                            s.style.display = "none",
                            r.style.display = "none",
                            a.style.display = "none",
                            l = !1
                        }),
                        o.addEventListener("seeking", function() {
                            s.style.display = "none",
                            r.style.display = "",
                            l = !1
                        }),
                        o.addEventListener("seeked", function() {
                            s.style.display = i.paused && !x.IS_STOCK_ANDROID ? "" : "none",
                            r.style.display = "none",
                            l = !1
                        }),
                        o.addEventListener("pause", function() {
                            r.style.display = "none",
                            x.IS_STOCK_ANDROID || l || (s.style.display = ""),
                            l = !1
                        }),
                        o.addEventListener("waiting", function() {
                            r.style.display = "",
                            l = !1
                        }),
                        o.addEventListener("loadeddata", function() {
                            r.style.display = "",
                            x.IS_ANDROID && (o.canplayTimeout = setTimeout(function() {
                                if (w.default.createEvent) {
                                    var e = w.default.createEvent("HTMLEvents");
                                    return e.initEvent("canplay", !0, !0),
                                    o.dispatchEvent(e)
                                }
                            }, 300)),
                            l = !1
                        }),
                        o.addEventListener("canplay", function() {
                            r.style.display = "none",
                            clearTimeout(o.canplayTimeout),
                            l = !1
                        }),
                        o.addEventListener("error", function(e) {
                            i._handleError(e, i.media, i.node),
                            r.style.display = "none",
                            s.style.display = "none",
                            l = !0
                        }),
                        o.addEventListener("loadedmetadata", function() {
                            i.controlsEnabled || i.enableControls()
                        }),
                        o.addEventListener("keydown", function(e) {
                            i.onkeydown(t, o, e),
                            l = !1
                        })
                    }
                }
            }, {
                key: "buildkeyboard",
                value: function(o, e, t, i) {
                    var r = this;
                    r.getElement(r.container).addEventListener("keydown", function() {
                        r.keyboardAction = !0
                    }),
                    r.globalKeydownCallback = function(e) {
                        var t = w.default.activeElement.closest("." + r.options.classPrefix + "container")
                          , n = r.media.closest("." + r.options.classPrefix + "container");
                        return r.hasFocus = !(!t || !n || t.id !== n.id),
                        r.onkeydown(o, i, e)
                    }
                    ,
                    r.globalClickCallback = function(e) {
                        r.hasFocus = !!e.target.closest("." + r.options.classPrefix + "container")
                    }
                    ,
                    r.globalBind("keydown", r.globalKeydownCallback),
                    r.globalBind("click", r.globalClickCallback)
                }
            }, {
                key: "onkeydown",
                value: function(e, t, n) {
                    if (e.hasFocus && e.options.enableKeyboard)
                        for (var o = 0, i = e.options.keyActions.length; o < i; o++)
                            for (var r = e.options.keyActions[o], a = 0, s = r.keys.length; a < s; a++)
                                if (n.keyCode === r.keys[a])
                                    return r.action(e, t, n.keyCode, n),
                                    n.preventDefault(),
                                    void n.stopPropagation();
                    return !0
                }
            }, {
                key: "play",
                value: function() {
                    this.proxy.play()
                }
            }, {
                key: "pause",
                value: function() {
                    this.proxy.pause()
                }
            }, {
                key: "load",
                value: function() {
                    this.proxy.load()
                }
            }, {
                key: "setCurrentTime",
                value: function(e) {
                    this.proxy.setCurrentTime(e)
                }
            }, {
                key: "getCurrentTime",
                value: function() {
                    return this.proxy.currentTime
                }
            }, {
                key: "getDuration",
                value: function() {
                    return this.proxy.duration
                }
            }, {
                key: "setVolume",
                value: function(e) {
                    this.proxy.volume = e
                }
            }, {
                key: "getVolume",
                value: function() {
                    return this.proxy.getVolume()
                }
            }, {
                key: "setMuted",
                value: function(e) {
                    this.proxy.setMuted(e)
                }
            }, {
                key: "setSrc",
                value: function(e) {
                    this.controlsEnabled || this.enableControls(),
                    this.proxy.setSrc(e)
                }
            }, {
                key: "getSrc",
                value: function() {
                    return this.proxy.getSrc()
                }
            }, {
                key: "canPlayType",
                value: function(e) {
                    return this.proxy.canPlayType(e)
                }
            }, {
                key: "remove",
                value: function() {
                    var l = this
                      , d = l.media.rendererName
                      , u = l.media.originalNode.src;
                    for (var e in l.options.features) {
                        var t = l.options.features[e];
                        if (l["clean" + t])
                            try {
                                l["clean" + t](l, l.getElement(l.layers), l.getElement(l.controls), l.media)
                            } catch (e) {
                                console.error("error cleaning " + t, e)
                            }
                    }
                    var n = l.node.getAttribute("width")
                      , o = l.node.getAttribute("height");
                    (n ? -1 === n.indexOf("%") && (n += "px") : n = "auto",
                    o ? -1 === o.indexOf("%") && (o += "px") : o = "auto",
                    l.node.style.width = n,
                    l.node.style.height = o,
                    l.setPlayerSize(0, 0),
                    l.isDynamic ? l.getElement(l.container).parentNode.insertBefore(l.node, l.getElement(l.container)) : function() {
                        l.node.setAttribute("controls", !0),
                        l.node.setAttribute("id", l.node.getAttribute("id").replace("_" + d, "").replace("_from_mejs", ""));
                        var e = l.getElement(l.container).querySelector("." + l.options.classPrefix + "poster>img");
                        (e && l.node.setAttribute("poster", e.src),
                        delete l.node.autoplay,
                        l.node.setAttribute("src", ""),
                        "" !== l.media.canPlayType((0,
                        b.getTypeFromFile)(u)) && l.node.setAttribute("src", u),
                        d && -1 < d.indexOf("iframe")) && w.default.getElementById(l.media.id + "-iframe-overlay").remove();
                        var i = l.node.cloneNode();
                        if (i.style.display = "",
                        l.getElement(l.container).parentNode.insertBefore(i, l.getElement(l.container)),
                        l.node.remove(),
                        l.mediaFiles)
                            for (var t = 0, n = l.mediaFiles.length; t < n; t++) {
                                var o = w.default.createElement("source");
                                o.setAttribute("src", l.mediaFiles[t].src),
                                o.setAttribute("type", l.mediaFiles[t].type),
                                i.appendChild(o)
                            }
                        if (l.trackFiles)
                            for (var r = function(e, t) {
                                var n = l.trackFiles[e]
                                  , o = w.default.createElement("track");
                                o.kind = n.kind,
                                o.label = n.label,
                                o.srclang = n.srclang,
                                o.src = n.src,
                                i.appendChild(o),
                                o.addEventListener("load", function() {
                                    this.mode = "showing",
                                    i.textTracks[e].mode = "showing"
                                })
                            }, a = 0, s = l.trackFiles.length; a < s; a++)
                                r(a);
                        delete l.node,
                        delete l.mediaFiles,
                        delete l.trackFiles
                    }(),
                    l.media.renderer && "function" == typeof l.media.renderer.destroy && l.media.renderer.destroy(),
                    delete v.default.players[l.id],
                    "object" === i(l.getElement(l.container))) && (l.getElement(l.container).parentNode.querySelector("." + l.options.classPrefix + "offscreen").remove(),
                    l.getElement(l.container).remove());
                    l.globalUnbind("resize", l.globalResizeCallback),
                    l.globalUnbind("keydown", l.globalKeydownCallback),
                    l.globalUnbind("click", l.globalClickCallback),
                    delete l.media.player
                }
            }, {
                key: "paused",
                get: function() {
                    return this.proxy.paused
                }
            }, {
                key: "muted",
                get: function() {
                    return this.proxy.muted
                },
                set: function(e) {
                    this.setMuted(e)
                }
            }, {
                key: "ended",
                get: function() {
                    return this.proxy.ended
                }
            }, {
                key: "readyState",
                get: function() {
                    return this.proxy.readyState
                }
            }, {
                key: "currentTime",
                set: function(e) {
                    this.setCurrentTime(e)
                },
                get: function() {
                    return this.getCurrentTime()
                }
            }, {
                key: "duration",
                get: function() {
                    return this.getDuration()
                }
            }, {
                key: "volume",
                set: function(e) {
                    this.setVolume(e)
                },
                get: function() {
                    return this.getVolume()
                }
            }, {
                key: "src",
                set: function(e) {
                    this.setSrc(e)
                },
                get: function() {
                    return this.getSrc()
                }
            }]),
            r
        }();
        S.default.MediaElementPlayer = l,
        v.default.MediaElementPlayer = l,
        n.default = l
    }
    , {
        19: 19,
        2: 2,
        27: 27,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        32: 32,
        7: 7,
        8: 8,
        9: 9
    }],
    19: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        });
        var o, i = function() {
            function o(e, t) {
                for (var n = 0; n < t.length; n++) {
                    var o = t[n];
                    o.enumerable = o.enumerable || !1,
                    o.configurable = !0,
                    "value"in o && (o.writable = !0),
                    Object.defineProperty(e, o.key, o)
                }
            }
            return function(e, t, n) {
                return t && o(e.prototype, t),
                n && o(e, n),
                e
            }
        }(), r = e(3), a = (o = r) && o.__esModule ? o : {
            default: o
        };
        var s = function() {
            function e(t) {
                return function(e, t) {
                    if (!(e instanceof t))
                        throw new TypeError("Cannot call a class as a function")
                }(this, e),
                this.media = t.media,
                this.isVideo = t.isVideo,
                this.classPrefix = t.options.classPrefix,
                this.createIframeLayer = function() {
                    return t.createIframeLayer()
                }
                ,
                this.setPoster = function(e) {
                    return t.setPoster(e)
                }
                ,
                this
            }
            return i(e, [{
                key: "play",
                value: function() {
                    this.media.play()
                }
            }, {
                key: "pause",
                value: function() {
                    this.media.pause()
                }
            }, {
                key: "load",
                value: function() {
                    this.isLoaded || this.media.load(),
                    this.isLoaded = !0
                }
            }, {
                key: "setCurrentTime",
                value: function(e) {
                    this.media.setCurrentTime(e)
                }
            }, {
                key: "getCurrentTime",
                value: function() {
                    return this.media.currentTime
                }
            }, {
                key: "getDuration",
                value: function() {
                    return this.media.getDuration()
                }
            }, {
                key: "setVolume",
                value: function(e) {
                    this.media.setVolume(e)
                }
            }, {
                key: "getVolume",
                value: function() {
                    return this.media.getVolume()
                }
            }, {
                key: "setMuted",
                value: function(e) {
                    this.media.setMuted(e)
                }
            }, {
                key: "setSrc",
                value: function(e) {
                    var t = this
                      , n = document.getElementById(t.media.id + "-iframe-overlay");
                    n && n.remove(),
                    t.media.setSrc(e),
                    t.createIframeLayer(),
                    null !== t.media.renderer && "function" == typeof t.media.renderer.getPosterUrl && t.setPoster(t.media.renderer.getPosterUrl())
                }
            }, {
                key: "getSrc",
                value: function() {
                    return this.media.getSrc()
                }
            }, {
                key: "canPlayType",
                value: function(e) {
                    return this.media.canPlayType(e)
                }
            }, {
                key: "paused",
                get: function() {
                    return this.media.paused
                }
            }, {
                key: "muted",
                set: function(e) {
                    this.setMuted(e)
                },
                get: function() {
                    return this.media.muted
                }
            }, {
                key: "ended",
                get: function() {
                    return this.media.ended
                }
            }, {
                key: "readyState",
                get: function() {
                    return this.media.readyState
                }
            }, {
                key: "currentTime",
                set: function(e) {
                    this.setCurrentTime(e)
                },
                get: function() {
                    return this.getCurrentTime()
                }
            }, {
                key: "duration",
                get: function() {
                    return this.getDuration()
                }
            }, {
                key: "remainingTime",
                get: function() {
                    return this.getDuration() - this.currentTime()
                }
            }, {
                key: "volume",
                set: function(e) {
                    this.setVolume(e)
                },
                get: function() {
                    return this.getVolume()
                }
            }, {
                key: "src",
                set: function(e) {
                    this.setSrc(e)
                },
                get: function() {
                    return this.getSrc()
                }
            }]),
            e
        }();
        n.default = s,
        a.default.DefaultPlayer = s
    }
    , {
        3: 3
    }],
    20: [function(e, t, n) {
        "use strict";
        a(e(3));
        var o, i = a(e(9)), r = a(e(18));
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        "undefined" != typeof jQuery ? i.default.$ = jQuery : "undefined" != typeof Zepto ? i.default.$ = Zepto : "undefined" != typeof ender && (i.default.$ = ender),
        void 0 !== (o = i.default.$) && (o.fn.mediaelementplayer = function(e) {
            return !1 === e ? this.each(function() {
                var e = o(this).data("mediaelementplayer");
                e && e.remove(),
                o(this).removeData("mediaelementplayer")
            }) : this.each(function() {
                o(this).data("mediaelementplayer", new r.default(this,e))
            }),
            this
        }
        ,
        o(document).ready(function() {
            o("." + i.default.MepDefaults.classPrefix + "player").mediaelementplayer()
        }))
    }
    , {
        18: 18,
        3: 3,
        9: 9
    }],
    21: [function(e, t, n) {
        "use strict";
        var b = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , S = a(e(3))
          , w = a(e(9))
          , x = e(10)
          , T = e(29)
          , o = e(30)
          , i = e(27)
          , r = e(28);
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var P = {
            promise: null,
            load: function(e) {
                return "undefined" != typeof dashjs ? P.promise = new Promise(function(e) {
                    e()
                }
                ).then(function() {
                    P._createPlayer(e)
                }) : (e.options.path = "string" == typeof e.options.path ? e.options.path : "https://cdn.dashjs.org/latest/dash.all.min.js",
                P.promise = P.promise || (0,
                r.loadScript)(e.options.path),
                P.promise.then(function() {
                    P._createPlayer(e)
                })),
                P.promise
            },
            _createPlayer: function(e) {
                var t = dashjs.MediaPlayer().create();
                return S.default["__ready__" + e.id](t),
                t
            }
        }
          , s = {
            name: "native_dash",
            options: {
                prefix: "native_dash",
                dash: {
                    path: "https://cdn.dashjs.org/latest/dash.all.min.js",
                    debug: !1,
                    drm: {},
                    robustnessLevel: ""
                }
            },
            canPlayType: function(e) {
                return i.HAS_MSE && -1 < ["application/dash+xml"].indexOf(e.toLowerCase())
            },
            create: function(s, l, e) {
                var t = s.originalNode
                  , r = s.id + "_" + l.prefix
                  , a = t.autoplay
                  , n = t.children
                  , d = null
                  , u = null;
                t.removeAttribute("type");
                for (var o = 0, i = n.length; o < i; o++)
                    n[o].removeAttribute("type");
                d = t.cloneNode(!0),
                l = Object.assign(l, s.options);
                for (var c = w.default.html5media.properties, f = w.default.html5media.events.concat(["click", "mouseover", "mouseout"]).filter(function(e) {
                    return "error" !== e
                }), p = function(e) {
                    var t = (0,
                    T.createEvent)(e.type, s);
                    s.dispatchEvent(t)
                }, m = function(i) {
                    var e = "" + i.substring(0, 1).toUpperCase() + i.substring(1);
                    d["get" + e] = function() {
                        return null !== u ? d[i] : null
                    }
                    ,
                    d["set" + e] = function(e) {
                        if (-1 === w.default.html5media.readOnlyProperties.indexOf(i))
                            if ("src" === i) {
                                var t = "object" === (void 0 === e ? "undefined" : b(e)) && e.src ? e.src : e;
                                if (d[i] = t,
                                null !== u) {
                                    u.reset();
                                    for (var n = 0, o = f.length; n < o; n++)
                                        d.removeEventListener(f[n], p);
                                    u = P._createPlayer({
                                        options: l.dash,
                                        id: r
                                    }),
                                    e && "object" === (void 0 === e ? "undefined" : b(e)) && "object" === b(e.drm) && (u.setProtectionData(e.drm),
                                    (0,
                                    T.isString)(l.dash.robustnessLevel) && l.dash.robustnessLevel && u.getProtectionController().setRobustnessLevel(l.dash.robustnessLevel)),
                                    u.attachSource(t),
                                    a && u.play()
                                }
                            } else
                                d[i] = e
                    }
                }, h = 0, v = c.length; h < v; h++)
                    m(c[h]);
                if (S.default["__ready__" + r] = function(e) {
                    s.dashPlayer = u = e;
                    for (var t, n = dashjs.MediaPlayer.events, o = 0, i = f.length; o < i; o++)
                        "loadedmetadata" === (t = f[o]) && (u.initialize(),
                        u.attachView(d),
                        u.setAutoPlay(!1),
                        "object" !== b(l.dash.drm) || w.default.Utils.isObjectEmpty(l.dash.drm) || (u.setProtectionData(l.dash.drm),
                        (0,
                        T.isString)(l.dash.robustnessLevel) && l.dash.robustnessLevel && u.getProtectionController().setRobustnessLevel(l.dash.robustnessLevel)),
                        u.attachSource(d.getSrc())),
                        d.addEventListener(t, p);
                    var r = function(e) {
                        if ("error" === e.type.toLowerCase())
                            s.generateError(e.message, d.src),
                            console.error(e);
                        else {
                            var t = (0,
                            T.createEvent)(e.type, s);
                            t.data = e,
                            s.dispatchEvent(t)
                        }
                    };
                    for (var a in n)
                        n.hasOwnProperty(a) && u.on(n[a], function(e) {
                            return r(e)
                        })
                }
                ,
                e && 0 < e.length)
                    for (var y = 0, g = e.length; y < g; y++)
                        if (x.renderer.renderers[l.prefix].canPlayType(e[y].type)) {
                            d.setAttribute("src", e[y].src),
                            void 0 !== e[y].drm && (l.dash.drm = e[y].drm);
                            break
                        }
                d.setAttribute("id", r),
                t.parentNode.insertBefore(d, t),
                t.autoplay = !1,
                t.style.display = "none",
                d.setSize = function(e, t) {
                    return d.style.width = e + "px",
                    d.style.height = t + "px",
                    d
                }
                ,
                d.hide = function() {
                    return d.pause(),
                    d.style.display = "none",
                    d
                }
                ,
                d.show = function() {
                    return d.style.display = "",
                    d
                }
                ,
                d.destroy = function() {
                    null !== u && u.reset()
                }
                ;
                var E = (0,
                T.createEvent)("rendererready", d);
                return s.dispatchEvent(E),
                s.promises.push(P.load({
                    options: l.dash,
                    id: r
                })),
                d
            }
        };
        o.typeChecks.push(function(e) {
            return ~e.toLowerCase().indexOf(".mpd") ? "application/dash+xml" : null
        }),
        x.renderer.add(s)
    }
    , {
        10: 10,
        27: 27,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        9: 9
    }],
    22: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.PluginDetector = void 0;
        var d = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , C = o(e(3))
          , k = o(e(2))
          , _ = o(e(9))
          , N = o(e(7))
          , A = e(10)
          , L = e(29)
          , F = e(27)
          , I = e(30);
        function o(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var r = n.PluginDetector = {
            plugins: [],
            hasPluginVersion: function(e, t) {
                var n = r.plugins[e];
                return t[1] = t[1] || 0,
                t[2] = t[2] || 0,
                n[0] > t[0] || n[0] === t[0] && n[1] > t[1] || n[0] === t[0] && n[1] === t[1] && n[2] >= t[2]
            },
            addPlugin: function(e, t, n, o, i) {
                r.plugins[e] = r.detectPlugin(t, n, o, i)
            },
            detectPlugin: function(e, t, n, o) {
                var i = [0, 0, 0]
                  , r = void 0
                  , a = void 0;
                if (null !== F.NAV.plugins && void 0 !== F.NAV.plugins && "object" === d(F.NAV.plugins[e])) {
                    if ((r = F.NAV.plugins[e].description) && (void 0 === F.NAV.mimeTypes || !F.NAV.mimeTypes[t] || F.NAV.mimeTypes[t].enabledPlugin))
                        for (var s = 0, l = (i = r.replace(e, "").replace(/^\s+/, "").replace(/\sr/gi, ".").split(".")).length; s < l; s++)
                            i[s] = parseInt(i[s].match(/\d+/), 10)
                } else if (void 0 !== C.default.ActiveXObject)
                    try {
                        (a = new ActiveXObject(n)) && (i = o(a))
                    } catch (e) {}
                return i
            }
        };
        r.addPlugin("flash", "Shockwave Flash", "application/x-shockwave-flash", "ShockwaveFlash.ShockwaveFlash", function(e) {
            var t = []
              , n = e.GetVariable("$version");
            return n && (n = n.split(" ")[1].split(","),
            t = [parseInt(n[0], 10), parseInt(n[1], 10), parseInt(n[2], 10)]),
            t
        });
        var i = {
            create: function(e, t, n) {
                var r = {}
                  , o = !1;
                r.options = t,
                r.id = e.id + "_" + r.options.prefix,
                r.mediaElement = e,
                r.flashState = {},
                r.flashApi = null,
                r.flashApiStack = [];
                for (var i = _.default.html5media.properties, a = function(t) {
                    r.flashState[t] = null;
                    var e = "" + t.substring(0, 1).toUpperCase() + t.substring(1);
                    r["get" + e] = function() {
                        if (null === r.flashApi)
                            return null;
                        if ("function" != typeof r.flashApi["get_" + t])
                            return null;
                        var e = r.flashApi["get_" + t]();
                        return "buffered" === t ? {
                            start: function() {
                                return 0
                            },
                            end: function() {
                                return e
                            },
                            length: 1
                        } : e
                    }
                    ,
                    r["set" + e] = function(e) {
                        if ("src" === t && (e = (0,
                        I.absolutizeUrl)(e)),
                        null !== r.flashApi && void 0 !== r.flashApi["set_" + t])
                            try {
                                r.flashApi["set_" + t](e)
                            } catch (e) {}
                        else
                            r.flashApiStack.push({
                                type: "set",
                                propName: t,
                                value: e
                            })
                    }
                }, s = 0, l = i.length; s < l; s++)
                    a(i[s]);
                var d = _.default.html5media.methods
                  , u = function(e) {
                    r[e] = function() {
                        if (o)
                            if (null !== r.flashApi) {
                                if (r.flashApi["fire_" + e])
                                    try {
                                        r.flashApi["fire_" + e]()
                                    } catch (e) {}
                            } else
                                r.flashApiStack.push({
                                    type: "call",
                                    methodName: e
                                })
                    }
                };
                d.push("stop");
                for (var c = 0, f = d.length; c < f; c++)
                    u(d[c]);
                for (var p = ["rendererready"], m = 0, h = p.length; m < h; m++) {
                    var v = (0,
                    L.createEvent)(p[m], r);
                    e.dispatchEvent(v)
                }
                C.default["__ready__" + r.id] = function() {
                    if (r.flashReady = !0,
                    r.flashApi = k.default.getElementById("__" + r.id),
                    r.flashApiStack.length)
                        for (var e = 0, t = r.flashApiStack.length; e < t; e++) {
                            var n = r.flashApiStack[e];
                            if ("set" === n.type) {
                                var o = n.propName
                                  , i = "" + o.substring(0, 1).toUpperCase() + o.substring(1);
                                r["set" + i](n.value)
                            } else
                                "call" === n.type && r[n.methodName]()
                        }
                }
                ,
                C.default["__event__" + r.id] = function(e, t) {
                    var n = (0,
                    L.createEvent)(e, r);
                    if (t)
                        try {
                            n.data = JSON.parse(t),
                            n.details.data = JSON.parse(t)
                        } catch (e) {
                            n.message = t
                        }
                    r.mediaElement.dispatchEvent(n)
                }
                ,
                r.flashWrapper = k.default.createElement("div"),
                -1 === ["always", "sameDomain"].indexOf(r.options.shimScriptAccess) && (r.options.shimScriptAccess = "sameDomain");
                var y = e.originalNode.autoplay
                  , g = ["uid=" + r.id, "autoplay=" + y, "allowScriptAccess=" + r.options.shimScriptAccess, "preload=" + (e.originalNode.getAttribute("preload") || "")]
                  , E = null !== e.originalNode && "video" === e.originalNode.tagName.toLowerCase()
                  , b = E ? e.originalNode.height : 1
                  , S = E ? e.originalNode.width : 1;
                e.originalNode.getAttribute("src") && g.push("src=" + e.originalNode.getAttribute("src")),
                !0 === r.options.enablePseudoStreaming && (g.push("pseudostreamstart=" + r.options.pseudoStreamingStartQueryParam),
                g.push("pseudostreamtype=" + r.options.pseudoStreamingType)),
                r.options.streamDelimiter && g.push("streamdelimiter=" + encodeURIComponent(r.options.streamDelimiter)),
                r.options.proxyType && g.push("proxytype=" + r.options.proxyType),
                e.appendChild(r.flashWrapper),
                e.originalNode.style.display = "none";
                var w = [];
                if (F.IS_IE || F.IS_EDGE) {
                    var x = k.default.createElement("div");
                    r.flashWrapper.appendChild(x),
                    w = F.IS_EDGE ? ['type="application/x-shockwave-flash"', 'data="' + r.options.pluginPath + r.options.filename + '"', 'id="__' + r.id + '"', 'width="' + S + '"', 'height="' + b + "'\""] : ['classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"', 'codebase="//download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab"', 'id="__' + r.id + '"', 'width="' + S + '"', 'height="' + b + '"'],
                    E || w.push('style="clip: rect(0 0 0 0); position: absolute;"'),
                    x.outerHTML = "<object " + w.join(" ") + '><param name="movie" value="' + r.options.pluginPath + r.options.filename + "?x=" + new Date + '" /><param name="flashvars" value="' + g.join("&amp;") + '" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="' + r.options.shimScriptAccess + '" /><param name="allowFullScreen" value="true" /><div>' + N.default.t("mejs.install-flash") + "</div></object>"
                } else
                    w = ['id="__' + r.id + '"', 'name="__' + r.id + '"', 'play="true"', 'loop="false"', 'quality="high"', 'bgcolor="#000000"', 'wmode="transparent"', 'allowScriptAccess="' + r.options.shimScriptAccess + '"', 'allowFullScreen="true"', 'type="application/x-shockwave-flash"', 'pluginspage="//www.macromedia.com/go/getflashplayer"', 'src="' + r.options.pluginPath + r.options.filename + '"', 'flashvars="' + g.join("&") + '"'],
                    E ? (w.push('width="' + S + '"'),
                    w.push('height="' + b + '"')) : w.push('style="position: fixed; left: -9999em; top: -9999em;"'),
                    r.flashWrapper.innerHTML = "<embed " + w.join(" ") + ">";
                if (r.flashNode = r.flashWrapper.lastChild,
                r.hide = function() {
                    o = !1,
                    E && (r.flashNode.style.display = "none")
                }
                ,
                r.show = function() {
                    o = !0,
                    E && (r.flashNode.style.display = "")
                }
                ,
                r.setSize = function(e, t) {
                    r.flashNode.style.width = e + "px",
                    r.flashNode.style.height = t + "px",
                    null !== r.flashApi && "function" == typeof r.flashApi.fire_setSize && r.flashApi.fire_setSize(e, t)
                }
                ,
                r.destroy = function() {
                    r.flashNode.remove()
                }
                ,
                n && 0 < n.length)
                    for (var T = 0, P = n.length; T < P; T++)
                        if (A.renderer.renderers[t.prefix].canPlayType(n[T].type)) {
                            r.setSrc(n[T].src);
                            break
                        }
                return r
            }
        };
        if (r.hasPluginVersion("flash", [10, 0, 0])) {
            I.typeChecks.push(function(e) {
                return (e = e.toLowerCase()).startsWith("rtmp") ? ~e.indexOf(".mp3") ? "audio/rtmp" : "video/rtmp" : /\.og(a|g)/i.test(e) ? "audio/ogg" : ~e.indexOf(".m3u8") ? "application/x-mpegURL" : ~e.indexOf(".mpd") ? "application/dash+xml" : ~e.indexOf(".flv") ? "video/flv" : null
            });
            var a = {
                name: "flash_video",
                options: {
                    prefix: "flash_video",
                    filename: "mediaelement-flash-video.swf",
                    enablePseudoStreaming: !1,
                    pseudoStreamingStartQueryParam: "start",
                    pseudoStreamingType: "byte",
                    proxyType: "",
                    streamDelimiter: ""
                },
                canPlayType: function(e) {
                    return ~["video/mp4", "video/rtmp", "audio/rtmp", "rtmp/mp4", "audio/mp4", "video/flv", "video/x-flv"].indexOf(e.toLowerCase())
                },
                create: i.create
            };
            A.renderer.add(a);
            var s = {
                name: "flash_hls",
                options: {
                    prefix: "flash_hls",
                    filename: "mediaelement-flash-video-hls.swf"
                },
                canPlayType: function(e) {
                    return ~["application/x-mpegurl", "application/vnd.apple.mpegurl", "audio/mpegurl", "audio/hls", "video/hls"].indexOf(e.toLowerCase())
                },
                create: i.create
            };
            A.renderer.add(s);
            var l = {
                name: "flash_dash",
                options: {
                    prefix: "flash_dash",
                    filename: "mediaelement-flash-video-mdash.swf"
                },
                canPlayType: function(e) {
                    return ~["application/dash+xml"].indexOf(e.toLowerCase())
                },
                create: i.create
            };
            A.renderer.add(l);
            var u = {
                name: "flash_audio",
                options: {
                    prefix: "flash_audio",
                    filename: "mediaelement-flash-audio.swf"
                },
                canPlayType: function(e) {
                    return ~["audio/mp3"].indexOf(e.toLowerCase())
                },
                create: i.create
            };
            A.renderer.add(u);
            var c = {
                name: "flash_audio_ogg",
                options: {
                    prefix: "flash_audio_ogg",
                    filename: "mediaelement-flash-audio-ogg.swf"
                },
                canPlayType: function(e) {
                    return ~["audio/ogg", "audio/oga", "audio/ogv"].indexOf(e.toLowerCase())
                },
                create: i.create
            };
            A.renderer.add(c)
        }
    }
    , {
        10: 10,
        2: 2,
        27: 27,
        29: 29,
        3: 3,
        30: 30,
        7: 7,
        9: 9
    }],
    23: [function(e, t, n) {
        "use strict";
        var g = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , E = a(e(3))
          , b = a(e(9))
          , S = e(10)
          , w = e(29)
          , o = e(27)
          , i = e(30)
          , r = e(28);
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var x = {
            promise: null,
            load: function(e) {
                return "undefined" != typeof flvjs ? x.promise = new Promise(function(e) {
                    e()
                }
                ).then(function() {
                    x._createPlayer(e)
                }) : (e.options.path = "string" == typeof e.options.path ? e.options.path : "https://cdn.jsdelivr.net/npm/flv.js@latest",
                x.promise = x.promise || (0,
                r.loadScript)(e.options.path),
                x.promise.then(function() {
                    x._createPlayer(e)
                })),
                x.promise
            },
            _createPlayer: function(e) {
                flvjs.LoggingControl.enableDebug = e.options.debug,
                flvjs.LoggingControl.enableVerbose = e.options.debug;
                var t = flvjs.createPlayer(e.options, e.configs);
                return E.default["__ready__" + e.id](t),
                t
            }
        }
          , s = {
            name: "native_flv",
            options: {
                prefix: "native_flv",
                flv: {
                    path: "https://cdn.jsdelivr.net/npm/flv.js@latest",
                    cors: !0,
                    debug: !1
                }
            },
            canPlayType: function(e) {
                return o.HAS_MSE && -1 < ["video/x-flv", "video/flv"].indexOf(e.toLowerCase())
            },
            create: function(s, a, e) {
                var t = s.originalNode
                  , l = s.id + "_" + a.prefix
                  , d = null
                  , u = null;
                d = t.cloneNode(!0),
                a = Object.assign(a, s.options);
                for (var n = b.default.html5media.properties, c = b.default.html5media.events.concat(["click", "mouseover", "mouseout"]).filter(function(e) {
                    return "error" !== e
                }), f = function(e) {
                    var t = (0,
                    w.createEvent)(e.type, s);
                    s.dispatchEvent(t)
                }, o = function(r) {
                    var e = "" + r.substring(0, 1).toUpperCase() + r.substring(1);
                    d["get" + e] = function() {
                        return null !== u ? d[r] : null
                    }
                    ,
                    d["set" + e] = function(e) {
                        if (-1 === b.default.html5media.readOnlyProperties.indexOf(r))
                            if ("src" === r) {
                                if (d[r] = "object" === (void 0 === e ? "undefined" : g(e)) && e.src ? e.src : e,
                                null !== u) {
                                    var t = {
                                        type: "flv"
                                    };
                                    t.url = e,
                                    t.cors = a.flv.cors,
                                    t.debug = a.flv.debug,
                                    t.path = a.flv.path;
                                    var n = a.flv.configs;
                                    u.destroy();
                                    for (var o = 0, i = c.length; o < i; o++)
                                        d.removeEventListener(c[o], f);
                                    (u = x._createPlayer({
                                        options: t,
                                        configs: n,
                                        id: l
                                    })).attachMediaElement(d),
                                    u.load()
                                }
                            } else
                                d[r] = e
                    }
                }, i = 0, r = n.length; i < r; i++)
                    o(n[i]);
                if (E.default["__ready__" + l] = function(e) {
                    s.flvPlayer = u = e;
                    for (var t, i = flvjs.Events, n = 0, o = c.length; n < o; n++)
                        "loadedmetadata" === (t = c[n]) && (u.unload(),
                        u.detachMediaElement(),
                        u.attachMediaElement(d),
                        u.load()),
                        d.addEventListener(t, f);
                    var r = function(o) {
                        i.hasOwnProperty(o) && u.on(i[o], function() {
                            for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
                                t[n] = arguments[n];
                            return function(e, t) {
                                if ("error" === e) {
                                    var n = t[0] + ": " + t[1] + " " + t[2].msg;
                                    s.generateError(n, d.src)
                                } else {
                                    var o = (0,
                                    w.createEvent)(e, s);
                                    o.data = t,
                                    s.dispatchEvent(o)
                                }
                            }(i[o], t)
                        })
                    };
                    for (var a in i)
                        r(a)
                }
                ,
                e && 0 < e.length)
                    for (var p = 0, m = e.length; p < m; p++)
                        if (S.renderer.renderers[a.prefix].canPlayType(e[p].type)) {
                            d.setAttribute("src", e[p].src);
                            break
                        }
                d.setAttribute("id", l),
                t.parentNode.insertBefore(d, t),
                t.autoplay = !1,
                t.style.display = "none";
                var h = {
                    type: "flv"
                };
                h.url = d.src,
                h.cors = a.flv.cors,
                h.debug = a.flv.debug,
                h.path = a.flv.path;
                var v = a.flv.configs;
                d.setSize = function(e, t) {
                    return d.style.width = e + "px",
                    d.style.height = t + "px",
                    d
                }
                ,
                d.hide = function() {
                    return null !== u && u.pause(),
                    d.style.display = "none",
                    d
                }
                ,
                d.show = function() {
                    return d.style.display = "",
                    d
                }
                ,
                d.destroy = function() {
                    null !== u && u.destroy()
                }
                ;
                var y = (0,
                w.createEvent)("rendererready", d);
                return s.dispatchEvent(y),
                s.promises.push(x.load({
                    options: h,
                    configs: v,
                    id: l
                })),
                d
            }
        };
        i.typeChecks.push(function(e) {
            return ~e.toLowerCase().indexOf(".flv") ? "video/flv" : null
        }),
        S.renderer.add(s)
    }
    , {
        10: 10,
        27: 27,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        9: 9
    }],
    24: [function(e, t, n) {
        "use strict";
        var g = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(e) {
            return typeof e
        }
        : function(e) {
            return e && "function" == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype ? "symbol" : typeof e
        }
          , E = a(e(3))
          , b = a(e(9))
          , S = e(10)
          , w = e(29)
          , o = e(27)
          , i = e(30)
          , r = e(28);
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var x = {
            promise: null,
            load: function(e) {
                return "undefined" != typeof Hls ? x.promise = new Promise(function(e) {
                    e()
                }
                ).then(function() {
                    x._createPlayer(e)
                }) : (e.options.path = "string" == typeof e.options.path ? e.options.path : "https://cdn.jsdelivr.net/npm/hls.js@latest",
                x.promise = x.promise || (0,
                r.loadScript)(e.options.path),
                x.promise.then(function() {
                    x._createPlayer(e)
                })),
                x.promise
            },
            _createPlayer: function(e) {
                var t = new Hls(e.options);
                return E.default["__ready__" + e.id](t),
                t
            }
        }
          , s = {
            name: "native_hls",
            options: {
                prefix: "native_hls",
                hls: {
                    path: "https://cdn.jsdelivr.net/npm/hls.js@latest",
                    autoStartLoad: !1,
                    debug: !1
                }
            },
            canPlayType: function(e) {
                return o.HAS_MSE && -1 < ["application/x-mpegurl", "application/vnd.apple.mpegurl", "audio/mpegurl", "audio/hls", "video/hls"].indexOf(e.toLowerCase())
            },
            create: function(d, i, u) {
                var e = d.originalNode
                  , r = d.id + "_" + i.prefix
                  , t = e.getAttribute("preload")
                  , n = e.autoplay
                  , c = null
                  , f = null
                  , p = 0
                  , m = u.length;
                f = e.cloneNode(!0),
                (i = Object.assign(i, d.options)).hls.autoStartLoad = t && "none" !== t || n;
                for (var o = b.default.html5media.properties, h = b.default.html5media.events.concat(["click", "mouseover", "mouseout"]).filter(function(e) {
                    return "error" !== e
                }), v = function(e) {
                    var t = (0,
                    w.createEvent)(e.type, d);
                    d.dispatchEvent(t)
                }, a = function(o) {
                    var e = "" + o.substring(0, 1).toUpperCase() + o.substring(1);
                    f["get" + e] = function() {
                        return null !== c ? f[o] : null
                    }
                    ,
                    f["set" + e] = function(e) {
                        if (-1 === b.default.html5media.readOnlyProperties.indexOf(o))
                            if ("src" === o) {
                                if (f[o] = "object" === (void 0 === e ? "undefined" : g(e)) && e.src ? e.src : e,
                                null !== c) {
                                    c.destroy();
                                    for (var t = 0, n = h.length; t < n; t++)
                                        f.removeEventListener(h[t], v);
                                    (c = x._createPlayer({
                                        options: i.hls,
                                        id: r
                                    })).loadSource(e),
                                    c.attachMedia(f)
                                }
                            } else
                                f[o] = e
                    }
                }, s = 0, l = o.length; s < l; s++)
                    a(o[s]);
                if (E.default["__ready__" + r] = function(e) {
                    d.hlsPlayer = c = e;
                    for (var i = Hls.Events, t = function(e) {
                        if ("loadedmetadata" === e) {
                            var t = d.originalNode.src;
                            c.detachMedia(),
                            c.loadSource(t),
                            c.attachMedia(f)
                        }
                        f.addEventListener(e, v)
                    }, n = 0, o = h.length; n < o; n++)
                        t(h[n]);
                    var s = void 0
                      , l = void 0
                      , r = function(o) {
                        i.hasOwnProperty(o) && c.on(i[o], function() {
                            for (var e = arguments.length, t = Array(e), n = 0; n < e; n++)
                                t[n] = arguments[n];
                            return function(e, t) {
                                if ("hlsError" === e && (console.warn(t),
                                (t = t[1]).fatal))
                                    switch (t.type) {
                                    case "mediaError":
                                        var n = (new Date).getTime();
                                        if (!s || 3e3 < n - s)
                                            s = (new Date).getTime(),
                                            c.recoverMediaError();
                                        else if (!l || 3e3 < n - l)
                                            l = (new Date).getTime(),
                                            console.warn("Attempting to swap Audio Codec and recover from media error"),
                                            c.swapAudioCodec(),
                                            c.recoverMediaError();
                                        else {
                                            var o = "Cannot recover, last media error recovery failed";
                                            d.generateError(o, f.src),
                                            console.error(o)
                                        }
                                        break;
                                    case "networkError":
                                        if ("manifestLoadError" === t.details)
                                            if (p < m && void 0 !== u[p + 1])
                                                f.setSrc(u[p++].src),
                                                f.load(),
                                                f.play();
                                            else {
                                                var i = "Network error";
                                                d.generateError(i, u),
                                                console.error(i)
                                            }
                                        else {
                                            var r = "Network error";
                                            d.generateError(r, u),
                                            console.error(r)
                                        }
                                        break;
                                    default:
                                        c.destroy()
                                    }
                                else {
                                    var a = (0,
                                    w.createEvent)(e, d);
                                    a.data = t,
                                    d.dispatchEvent(a)
                                }
                            }(i[o], t)
                        })
                    };
                    for (var a in i)
                        r(a)
                }
                ,
                0 < m)
                    for (; p < m; p++)
                        if (S.renderer.renderers[i.prefix].canPlayType(u[p].type)) {
                            f.setAttribute("src", u[p].src);
                            break
                        }
                "auto" === t || n || (f.addEventListener("play", function() {
                    null !== c && c.startLoad()
                }),
                f.addEventListener("pause", function() {
                    null !== c && c.stopLoad()
                })),
                f.setAttribute("id", r),
                e.parentNode.insertBefore(f, e),
                e.autoplay = !1,
                e.style.display = "none",
                f.setSize = function(e, t) {
                    return f.style.width = e + "px",
                    f.style.height = t + "px",
                    f
                }
                ,
                f.hide = function() {
                    return f.pause(),
                    f.style.display = "none",
                    f
                }
                ,
                f.show = function() {
                    return f.style.display = "",
                    f
                }
                ,
                f.destroy = function() {
                    null !== c && (c.stopLoad(),
                    c.destroy())
                }
                ;
                var y = (0,
                w.createEvent)("rendererready", f);
                return d.dispatchEvent(y),
                d.promises.push(x.load({
                    options: i.hls,
                    id: r
                })),
                f
            }
        };
        i.typeChecks.push(function(e) {
            return ~e.toLowerCase().indexOf(".m3u8") ? "application/x-mpegURL" : null
        }),
        S.renderer.add(s)
    }
    , {
        10: 10,
        27: 27,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        9: 9
    }],
    25: [function(e, t, n) {
        "use strict";
        var o = r(e(3))
          , y = r(e(2))
          , g = r(e(9))
          , E = e(10)
          , b = e(29)
          , i = e(27);
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var a = {
            name: "html5",
            options: {
                prefix: "html5"
            },
            canPlayType: function(e) {
                var t = y.default.createElement("video");
                return i.IS_ANDROID && /\/mp(3|4)$/i.test(e) || ~["application/x-mpegurl", "vnd.apple.mpegurl", "audio/mpegurl", "audio/hls", "video/hls"].indexOf(e.toLowerCase()) && i.SUPPORTS_NATIVE_HLS ? "yes" : t.canPlayType ? t.canPlayType(e.toLowerCase()).replace(/no/, "") : ""
            },
            create: function(n, e, t) {
                var o = n.id + "_" + e.prefix
                  , i = !1
                  , r = null;
                void 0 === n.originalNode || null === n.originalNode ? (r = y.default.createElement("audio"),
                n.appendChild(r)) : r = n.originalNode,
                r.setAttribute("id", o);
                for (var a = g.default.html5media.properties, s = function(t) {
                    var e = "" + t.substring(0, 1).toUpperCase() + t.substring(1);
                    r["get" + e] = function() {
                        return r[t]
                    }
                    ,
                    r["set" + e] = function(e) {
                        -1 === g.default.html5media.readOnlyProperties.indexOf(t) && (r[t] = e)
                    }
                }, l = 0, d = a.length; l < d; l++)
                    s(a[l]);
                for (var u, c = g.default.html5media.events.concat(["click", "mouseover", "mouseout"]).filter(function(e) {
                    return "error" !== e
                }), f = 0, p = c.length; f < p; f++)
                    u = c[f],
                    r.addEventListener(u, function(e) {
                        if (i) {
                            var t = (0,
                            b.createEvent)(e.type, e.target);
                            n.dispatchEvent(t)
                        }
                    });
                r.setSize = function(e, t) {
                    return r.style.width = e + "px",
                    r.style.height = t + "px",
                    r
                }
                ,
                r.hide = function() {
                    return i = !1,
                    r.style.display = "none",
                    r
                }
                ,
                r.show = function() {
                    return i = !0,
                    r.style.display = "",
                    r
                }
                ;
                var m = 0
                  , h = t.length;
                if (0 < h)
                    for (; m < h; m++)
                        if (E.renderer.renderers[e.prefix].canPlayType(t[m].type)) {
                            r.setAttribute("src", t[m].src);
                            break
                        }
                r.addEventListener("error", function(e) {
                    4 === e.target.error.code && i && (m < h && void 0 !== t[m + 1] ? (r.src = t[m++].src,
                    r.load(),
                    r.play()) : n.generateError("Media error: Format(s) not supported or source(s) not found", t))
                });
                var v = (0,
                b.createEvent)("rendererready", r);
                return n.dispatchEvent(v),
                r
            }
        };
        o.default.HtmlMediaElement = g.default.HtmlMediaElement = a,
        E.renderer.add(a)
    }
    , {
        10: 10,
        2: 2,
        27: 27,
        29: 29,
        3: 3,
        9: 9
    }],
    26: [function(e, t, n) {
        "use strict";
        var x = a(e(3))
          , T = a(e(2))
          , P = a(e(9))
          , o = e(10)
          , C = e(29)
          , i = e(30)
          , r = e(28);
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        var k = {
            isIframeStarted: !1,
            isIframeLoaded: !1,
            iframeQueue: [],
            enqueueIframe: function(e) {
                k.isLoaded = "undefined" != typeof YT && YT.loaded,
                k.isLoaded ? k.createIframe(e) : (k.loadIframeApi(),
                k.iframeQueue.push(e))
            },
            loadIframeApi: function() {
                k.isIframeStarted || ((0,
                r.loadScript)("https://www.youtube.com/player_api"),
                k.isIframeStarted = !0)
            },
            iFrameReady: function() {
                for (k.isLoaded = !0,
                k.isIframeLoaded = !0; 0 < k.iframeQueue.length; ) {
                    var e = k.iframeQueue.pop();
                    k.createIframe(e)
                }
            },
            createIframe: function(e) {
                return new YT.Player(e.containerId,e)
            },
            getYouTubeId: function(e) {
                var t = "";
                return 0 < e.indexOf("?") ? "" === (t = k.getYouTubeIdFromParam(e)) && (t = k.getYouTubeIdFromUrl(e)) : t = k.getYouTubeIdFromUrl(e),
                (t = t.substring(t.lastIndexOf("/") + 1).split("?"))[0]
            },
            getYouTubeIdFromParam: function(e) {
                if (null == e || !e.trim().length)
                    return null;
                for (var t = e.split("?")[1].split("&"), n = "", o = 0, i = t.length; o < i; o++) {
                    var r = t[o].split("=");
                    if ("v" === r[0]) {
                        n = r[1];
                        break
                    }
                }
                return n
            },
            getYouTubeIdFromUrl: function(e) {
                return null != e && e.trim().length ? (e = e.split("?")[0]).substring(e.lastIndexOf("/") + 1) : null
            },
            getYouTubeNoCookieUrl: function(e) {
                if (null == e || !e.trim().length || -1 === e.indexOf("//www.youtube"))
                    return e;
                var t = e.split("/");
                return t[2] = t[2].replace(".com", "-nocookie.com"),
                t.join("/")
            }
        }
          , s = {
            name: "youtube_iframe",
            options: {
                prefix: "youtube_iframe",
                youtube: {
                    autoplay: 0,
                    controls: 0,
                    disablekb: 1,
                    end: 0,
                    loop: 0,
                    modestbranding: 0,
                    playsinline: 0,
                    rel: 0,
                    showinfo: 0,
                    start: 0,
                    iv_load_policy: 3,
                    nocookie: !1,
                    imageQuality: null
                }
            },
            canPlayType: function(e) {
                return ~["video/youtube", "video/x-youtube"].indexOf(e.toLowerCase())
            },
            create: function(m, n, o) {
                var h = {}
                  , v = []
                  , y = null
                  , r = !0
                  , a = !1
                  , g = null;
                h.options = n,
                h.id = m.id + "_" + n.prefix,
                h.mediaElement = m;
                for (var e = P.default.html5media.properties, t = function(i) {
                    var e = "" + i.substring(0, 1).toUpperCase() + i.substring(1);
                    h["get" + e] = function() {
                        if (null === y)
                            return null;
                        switch (i) {
                        case "currentTime":
                            return y.getCurrentTime();
                        case "duration":
                            return y.getDuration();
                        case "volume":
                            return y.getVolume() / 100;
                        case "playbackRate":
                            return y.getPlaybackRate();
                        case "paused":
                            return r;
                        case "ended":
                            return a;
                        case "muted":
                            return y.isMuted();
                        case "buffered":
                            var e = y.getVideoLoadedFraction()
                              , t = y.getDuration();
                            return {
                                start: function() {
                                    return 0
                                },
                                end: function() {
                                    return e * t
                                },
                                length: 1
                            };
                        case "src":
                            return y.getVideoUrl();
                        case "readyState":
                            return 4
                        }
                        return null
                    }
                    ,
                    h["set" + e] = function(e) {
                        if (null !== y)
                            switch (i) {
                            case "src":
                                var t = "string" == typeof e ? e : e[0].src
                                  , n = k.getYouTubeId(t);
                                m.originalNode.autoplay ? y.loadVideoById(n) : y.cueVideoById(n);
                                break;
                            case "currentTime":
                                y.seekTo(e);
                                break;
                            case "muted":
                                e ? y.mute() : y.unMute(),
                                setTimeout(function() {
                                    var e = (0,
                                    C.createEvent)("volumechange", h);
                                    m.dispatchEvent(e)
                                }, 50);
                                break;
                            case "volume":
                                e,
                                y.setVolume(100 * e),
                                setTimeout(function() {
                                    var e = (0,
                                    C.createEvent)("volumechange", h);
                                    m.dispatchEvent(e)
                                }, 50);
                                break;
                            case "playbackRate":
                                y.setPlaybackRate(e),
                                setTimeout(function() {
                                    var e = (0,
                                    C.createEvent)("ratechange", h);
                                    m.dispatchEvent(e)
                                }, 50);
                                break;
                            case "readyState":
                                var o = (0,
                                C.createEvent)("canplay", h);
                                m.dispatchEvent(o)
                            }
                        else
                            v.push({
                                type: "set",
                                propName: i,
                                value: e
                            })
                    }
                }, i = 0, s = e.length; i < s; i++)
                    t(e[i]);
                for (var l = P.default.html5media.methods, d = function(e) {
                    h[e] = function() {
                        if (null !== y)
                            switch (e) {
                            case "play":
                                return r = !1,
                                y.playVideo();
                            case "pause":
                                return r = !0,
                                y.pauseVideo();
                            case "load":
                                return null
                            }
                        else
                            v.push({
                                type: "call",
                                methodName: e
                            })
                    }
                }, u = 0, c = l.length; u < c; u++)
                    d(l[u]);
                var f = T.default.createElement("div");
                f.id = h.id,
                h.options.youtube.nocookie && (m.originalNode.src = k.getYouTubeNoCookieUrl(o[0].src)),
                m.originalNode.parentNode.insertBefore(f, m.originalNode),
                m.originalNode.style.display = "none";
                var p = "audio" === m.originalNode.tagName.toLowerCase()
                  , E = p ? "1" : m.originalNode.height
                  , b = p ? "1" : m.originalNode.width
                  , S = k.getYouTubeId(o[0].src)
                  , w = {
                    id: h.id,
                    containerId: f.id,
                    videoId: S,
                    height: E,
                    width: b,
                    playerVars: Object.assign({
                        controls: 0,
                        rel: 0,
                        disablekb: 1,
                        showinfo: 0,
                        modestbranding: 0,
                        html5: 1,
                        iv_load_policy: 3
                    }, h.options.youtube),
                    origin: x.default.location.host,
                    events: {
                        onReady: function(e) {
                            if (m.youTubeApi = y = e.target,
                            m.youTubeState = {
                                paused: !0,
                                ended: !1
                            },
                            v.length)
                                for (var t = 0, n = v.length; t < n; t++) {
                                    var o = v[t];
                                    if ("set" === o.type) {
                                        var i = o.propName
                                          , r = "" + i.substring(0, 1).toUpperCase() + i.substring(1);
                                        h["set" + r](o.value)
                                    } else
                                        "call" === o.type && h[o.methodName]()
                                }
                            g = y.getIframe(),
                            m.originalNode.muted && y.mute();
                            for (var a = ["mouseover", "mouseout"], s = function(e) {
                                var t = (0,
                                C.createEvent)(e.type, h);
                                m.dispatchEvent(t)
                            }, l = 0, d = a.length; l < d; l++)
                                g.addEventListener(a[l], s, !1);
                            for (var u = ["rendererready", "loadedmetadata", "loadeddata", "canplay"], c = 0, f = u.length; c < f; c++) {
                                var p = (0,
                                C.createEvent)(u[c], h);
                                m.dispatchEvent(p)
                            }
                        },
                        onStateChange: function(e) {
                            var t = [];
                            switch (e.data) {
                            case -1:
                                t = ["loadedmetadata"],
                                a = !(r = !0);
                                break;
                            case 0:
                                r = !(t = ["ended"]),
                                a = !h.options.youtube.loop,
                                h.options.youtube.loop || h.stopInterval();
                                break;
                            case 1:
                                a = r = !(t = ["play", "playing"]),
                                h.startInterval();
                                break;
                            case 2:
                                t = ["pause"],
                                a = !(r = !0),
                                h.stopInterval();
                                break;
                            case 3:
                                a = !(t = ["progress"]);
                                break;
                            case 5:
                                t = ["loadeddata", "loadedmetadata", "canplay"],
                                a = !(r = !0)
                            }
                            for (var n = 0, o = t.length; n < o; n++) {
                                var i = (0,
                                C.createEvent)(t[n], h);
                                m.dispatchEvent(i)
                            }
                        },
                        onError: function(e) {
                            return function(e) {
                                var t = "";
                                switch (e.data) {
                                case 2:
                                    t = "The request contains an invalid parameter value. Verify that video ID has 11 characters and that contains no invalid characters, such as exclamation points or asterisks.";
                                    break;
                                case 5:
                                    t = "The requested content cannot be played in an HTML5 player or another error related to the HTML5 player has occurred.";
                                    break;
                                case 100:
                                    t = "The video requested was not found. Either video has been removed or has been marked as private.";
                                    break;
                                case 101:
                                case 105:
                                    t = "The owner of the requested video does not allow it to be played in embedded players.";
                                    break;
                                default:
                                    t = "Unknown error."
                                }
                                m.generateError("Code " + e.data + ": " + t, o)
                            }(e)
                        }
                    }
                };
                return (p || m.originalNode.hasAttribute("playsinline")) && (w.playerVars.playsinline = 1),
                m.originalNode.controls && (w.playerVars.controls = 1),
                m.originalNode.autoplay && (w.playerVars.autoplay = 1),
                m.originalNode.loop && (w.playerVars.loop = 1),
                (w.playerVars.loop && 1 === parseInt(w.playerVars.loop, 10) || -1 < m.originalNode.src.indexOf("loop=")) && !w.playerVars.playlist && -1 === m.originalNode.src.indexOf("playlist=") && (w.playerVars.playlist = k.getYouTubeId(m.originalNode.src)),
                k.enqueueIframe(w),
                h.onEvent = function(e, t, n) {
                    null != n && (m.youTubeState = n)
                }
                ,
                h.setSize = function(e, t) {
                    null !== y && y.setSize(e, t)
                }
                ,
                h.hide = function() {
                    h.stopInterval(),
                    h.pause(),
                    g && (g.style.display = "none")
                }
                ,
                h.show = function() {
                    g && (g.style.display = "")
                }
                ,
                h.destroy = function() {
                    y.destroy()
                }
                ,
                h.interval = null,
                h.startInterval = function() {
                    h.interval = setInterval(function() {
                        var e = (0,
                        C.createEvent)("timeupdate", h);
                        m.dispatchEvent(e)
                    }, 250)
                }
                ,
                h.stopInterval = function() {
                    h.interval && clearInterval(h.interval)
                }
                ,
                h.getPosterUrl = function() {
                    var e = n.youtube.imageQuality
                      , t = k.getYouTubeId(m.originalNode.src);
                    return e && -1 < ["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault"].indexOf(e) && t ? "https://img.youtube.com/vi/" + t + "/" + e + ".jpg" : ""
                }
                ,
                h
            }
        };
        x.default.onYouTubePlayerAPIReady = function() {
            k.iFrameReady()
        }
        ,
        i.typeChecks.push(function(e) {
            return /\/\/(www\.youtube|youtu\.?be)/i.test(e) ? "video/x-youtube" : null
        }),
        o.renderer.add(s)
    }
    , {
        10: 10,
        2: 2,
        28: 28,
        29: 29,
        3: 3,
        30: 30,
        9: 9
    }],
    27: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.cancelFullScreen = n.requestFullScreen = n.isFullScreen = n.FULLSCREEN_EVENT_NAME = n.HAS_NATIVE_FULLSCREEN_ENABLED = n.HAS_TRUE_NATIVE_FULLSCREEN = n.HAS_IOS_FULLSCREEN = n.HAS_MS_NATIVE_FULLSCREEN = n.HAS_MOZ_NATIVE_FULLSCREEN = n.HAS_WEBKIT_NATIVE_FULLSCREEN = n.HAS_NATIVE_FULLSCREEN = n.SUPPORTS_NATIVE_HLS = n.SUPPORT_PASSIVE_EVENT = n.SUPPORT_POINTER_EVENTS = n.HAS_MSE = n.IS_STOCK_ANDROID = n.IS_SAFARI = n.IS_FIREFOX = n.IS_CHROME = n.IS_EDGE = n.IS_IE = n.IS_ANDROID = n.IS_IOS = n.IS_IPOD = n.IS_IPHONE = n.IS_IPAD = n.UA = n.NAV = void 0;
        var i = a(e(3))
          , r = a(e(2))
          , o = a(e(9));
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        for (var s = n.NAV = i.default.navigator, l = n.UA = s.userAgent.toLowerCase(), d = n.IS_IPAD = /ipad/i.test(l) && !i.default.MSStream, u = n.IS_IPHONE = /iphone/i.test(l) && !i.default.MSStream, c = n.IS_IPOD = /ipod/i.test(l) && !i.default.MSStream, f = (n.IS_IOS = /ipad|iphone|ipod/i.test(l) && !i.default.MSStream,
        n.IS_ANDROID = /android/i.test(l)), p = n.IS_IE = /(trident|microsoft)/i.test(s.appName), m = (n.IS_EDGE = "msLaunchUri"in s && !("documentMode"in r.default)), h = n.IS_CHROME = /chrome/i.test(l), v = n.IS_FIREFOX = /firefox/i.test(l), y = n.IS_SAFARI = /safari/i.test(l) && !h, g = n.IS_STOCK_ANDROID = /^mozilla\/\d+\.\d+\s\(linux;\su;/i.test(l), E = (n.HAS_MSE = "MediaSource"in i.default), b = n.SUPPORT_POINTER_EVENTS = function() {
            var e = r.default.createElement("x")
              , t = r.default.documentElement
              , n = i.default.getComputedStyle;
            if (!("pointerEvents"in e.style))
                return !1;
            e.style.pointerEvents = "auto",
            e.style.pointerEvents = "x",
            t.appendChild(e);
            var o = n && "auto" === (n(e, "") || {}).pointerEvents;
            return e.remove(),
            !!o
        }(), S = n.SUPPORT_PASSIVE_EVENT = function() {
            var e = !1;
            try {
                var t = Object.defineProperty({}, "passive", {
                    get: function() {
                        e = !0
                    }
                });
                i.default.addEventListener("test", null, t)
            } catch (e) {}
            return e
        }(), w = ["source", "track", "audio", "video"], x = void 0, T = 0, P = w.length; T < P; T++)
            x = r.default.createElement(w[T]);
        var C = n.SUPPORTS_NATIVE_HLS = y || f && (h || g) || p && /edge/i.test(l)
          , k = void 0 !== x.webkitEnterFullscreen
          , _ = void 0 !== x.requestFullscreen;
        k && /mac os x 10_5/i.test(l) && (k = _ = !1);
        var N = void 0 !== x.webkitRequestFullScreen
          , A = void 0 !== x.mozRequestFullScreen
          , L = void 0 !== x.msRequestFullscreen
          , F = N || A || L
          , I = F
          , j = ""
          , M = void 0
          , O = void 0
          , D = void 0;
        A ? I = r.default.mozFullScreenEnabled : L && (I = r.default.msFullscreenEnabled),
        h && (k = !1),
        F && (N ? j = "webkitfullscreenchange" : A ? j = "mozfullscreenchange" : L && (j = "MSFullscreenChange"),
        n.isFullScreen = M = function() {
            return A ? r.default.mozFullScreen : N ? r.default.webkitIsFullScreen : L ? null !== r.default.msFullscreenElement : void 0
        }
        ,
        n.requestFullScreen = O = function(e) {
            N ? e.webkitRequestFullScreen() : A ? e.mozRequestFullScreen() : L && e.msRequestFullscreen()
        }
        ,
        n.cancelFullScreen = D = function() {
            N ? r.default.webkitCancelFullScreen() : A ? r.default.mozCancelFullScreen() : L && r.default.msExitFullscreen()
        }
        );
        var R = n.HAS_NATIVE_FULLSCREEN = _
          , V = n.HAS_WEBKIT_NATIVE_FULLSCREEN = N
          , H = n.HAS_MOZ_NATIVE_FULLSCREEN = A
          , U = n.HAS_MS_NATIVE_FULLSCREEN = L
          , q = n.HAS_IOS_FULLSCREEN = k
          , B = n.HAS_TRUE_NATIVE_FULLSCREEN = F
          , z = n.HAS_NATIVE_FULLSCREEN_ENABLED = I
          , W = n.FULLSCREEN_EVENT_NAME = j;
        n.isFullScreen = M,
        n.requestFullScreen = O,
        n.cancelFullScreen = D,
        o.default.Features = o.default.Features || {},
        o.default.Features.isiPad = d,
        o.default.Features.isiPod = c,
        o.default.Features.isiPhone = u,
        o.default.Features.isiOS = o.default.Features.isiPhone || o.default.Features.isiPad,
        o.default.Features.isAndroid = f,
        o.default.Features.isIE = p,
        o.default.Features.isEdge = m,
        o.default.Features.isChrome = h,
        o.default.Features.isFirefox = v,
        o.default.Features.isSafari = y,
        o.default.Features.isStockAndroid = g,
        o.default.Features.hasMSE = E,
        o.default.Features.supportsNativeHLS = C,
        o.default.Features.supportsPointerEvents = b,
        o.default.Features.supportsPassiveEvent = S,
        o.default.Features.hasiOSFullScreen = q,
        o.default.Features.hasNativeFullscreen = R,
        o.default.Features.hasWebkitNativeFullScreen = V,
        o.default.Features.hasMozNativeFullScreen = H,
        o.default.Features.hasMsNativeFullScreen = U,
        o.default.Features.hasTrueNativeFullScreen = B,
        o.default.Features.nativeFullScreenEnabled = z,
        o.default.Features.fullScreenEventName = W,
        o.default.Features.isFullScreen = M,
        o.default.Features.requestFullScreen = O,
        o.default.Features.cancelFullScreen = D
    }
    , {
        2: 2,
        3: 3,
        9: 9
    }],
    28: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.removeClass = n.addClass = n.hasClass = void 0,
        n.loadScript = a,
        n.offset = s,
        n.toggleClass = h,
        n.fadeOut = v,
        n.fadeIn = y,
        n.siblings = g,
        n.visible = E,
        n.ajax = b;
        var l = r(e(3))
          , i = r(e(2))
          , o = r(e(9));
        function r(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        function a(o) {
            return new Promise(function(e, t) {
                var n = i.default.createElement("script");
                n.src = o,
                n.async = !0,
                n.onload = function() {
                    n.remove(),
                    e()
                }
                ,
                n.onerror = function() {
                    n.remove(),
                    t()
                }
                ,
                i.default.head.appendChild(n)
            }
            )
        }
        function s(e) {
            var t = e.getBoundingClientRect()
              , n = l.default.pageXOffset || i.default.documentElement.scrollLeft
              , o = l.default.pageYOffset || i.default.documentElement.scrollTop;
            return {
                top: t.top + o,
                left: t.left + n
            }
        }
        var d = void 0
          , u = void 0
          , c = void 0;
        c = "classList"in i.default.documentElement ? (d = function(e, t) {
            return void 0 !== e.classList && e.classList.contains(t)
        }
        ,
        u = function(e, t) {
            return e.classList.add(t)
        }
        ,
        function(e, t) {
            return e.classList.remove(t)
        }
        ) : (d = function(e, t) {
            return new RegExp("\\b" + t + "\\b").test(e.className)
        }
        ,
        u = function(e, t) {
            f(e, t) || (e.className += " " + t)
        }
        ,
        function(e, t) {
            e.className = e.className.replace(new RegExp("\\b" + t + "\\b","g"), "")
        }
        );
        var f = n.hasClass = d
          , p = n.addClass = u
          , m = n.removeClass = c;
        function h(e, t) {
            f(e, t) ? m(e, t) : p(e, t)
        }
        function v(i) {
            var r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 400
              , a = arguments[2];
            i.style.opacity || (i.style.opacity = 1);
            var s = null;
            l.default.requestAnimationFrame(function e(t) {
                var n = t - (s = s || t)
                  , o = parseFloat(1 - n / r, 2);
                i.style.opacity = o < 0 ? 0 : o,
                r < n ? a && "function" == typeof a && a() : l.default.requestAnimationFrame(e)
            })
        }
        function y(i) {
            var r = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 400
              , a = arguments[2];
            i.style.opacity || (i.style.opacity = 0);
            var s = null;
            l.default.requestAnimationFrame(function e(t) {
                var n = t - (s = s || t)
                  , o = parseFloat(n / r, 2);
                i.style.opacity = 1 < o ? 1 : o,
                r < n ? a && "function" == typeof a && a() : l.default.requestAnimationFrame(e)
            })
        }
        function g(e, t) {
            var n = [];
            for (e = e.parentNode.firstChild; t && !t(e) || n.push(e),
            e = e.nextSibling; )
                ;
            return n
        }
        function E(e) {
            return void 0 !== e.getClientRects && "function" === e.getClientRects ? !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) : !(!e.offsetWidth && !e.offsetHeight)
        }
        function b(e, t, n, o) {
            var i = l.default.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP")
              , r = "application/x-www-form-urlencoded; charset=UTF-8"
              , a = !1
              , s = "*/".concat("*");
            switch (t) {
            case "text":
                r = "text/plain";
                break;
            case "json":
                r = "application/json, text/javascript";
                break;
            case "html":
                r = "text/html";
                break;
            case "xml":
                r = "application/xml, text/xml"
            }
            "application/x-www-form-urlencoded" !== r && (s = r + ", */*; q=0.01"),
            i && (i.open("GET", e, !0),
            i.setRequestHeader("Accept", s),
            i.onreadystatechange = function() {
                if (!a && 4 === i.readyState)
                    if (200 === i.status) {
                        a = !0;
                        var e = void 0;
                        switch (t) {
                        case "json":
                            e = JSON.parse(i.responseText);
                            break;
                        case "xml":
                            e = i.responseXML;
                            break;
                        default:
                            e = i.responseText
                        }
                        n(e)
                    } else
                        "function" == typeof o && o(i.status)
            }
            ,
            i.send())
        }
        o.default.Utils = o.default.Utils || {},
        o.default.Utils.offset = s,
        o.default.Utils.hasClass = f,
        o.default.Utils.addClass = p,
        o.default.Utils.removeClass = m,
        o.default.Utils.toggleClass = h,
        o.default.Utils.fadeIn = y,
        o.default.Utils.fadeOut = v,
        o.default.Utils.siblings = g,
        o.default.Utils.visible = E,
        o.default.Utils.ajax = b,
        o.default.Utils.loadScript = a
    }
    , {
        2: 2,
        3: 3,
        9: 9
    }],
    29: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.escapeHTML = a,
        n.debounce = s,
        n.isObjectEmpty = l,
        n.splitEvents = d,
        n.createEvent = u,
        n.isNodeAfter = c,
        n.isString = f;
        var o, i = e(9), r = (o = i) && o.__esModule ? o : {
            default: o
        };
        function a(e) {
            if ("string" != typeof e)
                throw new Error("Argument passed must be a string");
            var t = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;"
            };
            return e.replace(/[&<>"]/g, function(e) {
                return t[e]
            })
        }
        function s(o, i) {
            var r = this
              , a = arguments
              , s = 2 < arguments.length && void 0 !== arguments[2] && arguments[2];
            if ("function" != typeof o)
                throw new Error("First argument must be a function");
            if ("number" != typeof i)
                throw new Error("Second argument must be a numeric value");
            var l = void 0;
            return function() {
                var e = r
                  , t = a
                  , n = s && !l;
                clearTimeout(l),
                l = setTimeout(function() {
                    l = null,
                    s || o.apply(e, t)
                }, i),
                n && o.apply(e, t)
            }
        }
        function l(e) {
            return Object.getOwnPropertyNames(e).length <= 0
        }
        function d(e, n) {
            var o = /^((after|before)print|(before)?unload|hashchange|message|o(ff|n)line|page(hide|show)|popstate|resize|storage)\b/
              , i = {
                d: [],
                w: []
            };
            return (e || "").split(" ").forEach(function(e) {
                var t = e + (n ? "." + n : "");
                t.startsWith(".") ? (i.d.push(t),
                i.w.push(t)) : i[o.test(e) ? "w" : "d"].push(t)
            }),
            i.d = i.d.join(" "),
            i.w = i.w.join(" "),
            i
        }
        function u(e, t) {
            if ("string" != typeof e)
                throw new Error("Event name must be a string");
            var n = e.match(/([a-z]+\.([a-z]+))/i)
              , o = {
                target: t
            };
            return null !== n && (e = n[1],
            o.namespace = n[2]),
            new window.CustomEvent(e,{
                detail: o
            })
        }
        function c(e, t) {
            return !!(e && t && 2 & e.compareDocumentPosition(t))
        }
        function f(e) {
            return "string" == typeof e
        }
        r.default.Utils = r.default.Utils || {},
        r.default.Utils.escapeHTML = a,
        r.default.Utils.debounce = s,
        r.default.Utils.isObjectEmpty = l,
        r.default.Utils.splitEvents = d,
        r.default.Utils.createEvent = u,
        r.default.Utils.isNodeAfter = c,
        r.default.Utils.isString = f
    }
    , {
        9: 9
    }],
    30: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.typeChecks = void 0,
        n.absolutizeUrl = l,
        n.formatType = d,
        n.getMimeFromType = u,
        n.getTypeFromFile = c,
        n.getExtension = f,
        n.normalizeExtension = p;
        var o, i = e(9), r = (o = i) && o.__esModule ? o : {
            default: o
        }, a = e(29);
        var s = n.typeChecks = [];
        function l(e) {
            if ("string" != typeof e)
                throw new Error("`url` argument must be a string");
            var t = document.createElement("div");
            return t.innerHTML = '<a href="' + (0,
            a.escapeHTML)(e) + '">x</a>',
            t.firstChild.href
        }
        function d(e) {
            var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : "";
            return e && !t ? c(e) : t
        }
        function u(e) {
            if ("string" != typeof e)
                throw new Error("`type` argument must be a string");
            return e && -1 < e.indexOf(";") ? e.substr(0, e.indexOf(";")) : e
        }
        function c(e) {
            if ("string" != typeof e)
                throw new Error("`url` argument must be a string");
            for (var t = 0, n = s.length; t < n; t++) {
                var o = s[t](e);
                if (o)
                    return o
            }
            var i = p(f(e))
              , r = "video/mp4";
            return i && (~["mp4", "m4v", "ogg", "ogv", "webm", "flv", "mpeg", "mov"].indexOf(i) ? r = "video/" + i : ~["mp3", "oga", "wav", "mid", "midi"].indexOf(i) && (r = "audio/" + i)),
            r
        }
        function f(e) {
            if ("string" != typeof e)
                throw new Error("`url` argument must be a string");
            var t = e.split("?")[0].split("\\").pop().split("/").pop();
            return ~t.indexOf(".") ? t.substring(t.lastIndexOf(".") + 1) : ""
        }
        function p(e) {
            if ("string" != typeof e)
                throw new Error("`extension` argument must be a string");
            switch (e) {
            case "mp4":
            case "m4v":
                return "mp4";
            case "webm":
            case "webma":
            case "webmv":
                return "webm";
            case "ogg":
            case "oga":
            case "ogv":
                return "ogg";
            default:
                return e
            }
        }
        r.default.Utils = r.default.Utils || {},
        r.default.Utils.typeChecks = s,
        r.default.Utils.absolutizeUrl = l,
        r.default.Utils.formatType = d,
        r.default.Utils.getMimeFromType = u,
        r.default.Utils.getTypeFromFile = c,
        r.default.Utils.getExtension = f,
        r.default.Utils.normalizeExtension = p
    }
    , {
        29: 29,
        9: 9
    }],
    31: [function(e, t, n) {
        "use strict";
        var o, i = a(e(2)), r = a(e(5));
        function a(e) {
            return e && e.__esModule ? e : {
                default: e
            }
        }
        if ([Element.prototype, CharacterData.prototype, DocumentType.prototype].forEach(function(e) {
            e.hasOwnProperty("remove") || Object.defineProperty(e, "remove", {
                configurable: !0,
                enumerable: !0,
                writable: !0,
                value: function() {
                    this.parentNode.removeChild(this)
                }
            })
        }),
        function() {
            if ("function" == typeof window.CustomEvent)
                return;
            function e(e, t) {
                t = t || {
                    bubbles: !1,
                    cancelable: !1,
                    detail: void 0
                };
                var n = i.default.createEvent("CustomEvent");
                return n.initCustomEvent(e, t.bubbles, t.cancelable, t.detail),
                n
            }
            e.prototype = window.Event.prototype,
            window.CustomEvent = e
        }(),
        "function" != typeof Object.assign && (Object.assign = function(e) {
            if (null == e)
                throw new TypeError("Cannot convert undefined or null to object");
            for (var t = Object(e), n = 1, o = arguments.length; n < o; n++) {
                var i = arguments[n];
                if (null !== i)
                    for (var r in i)
                        Object.prototype.hasOwnProperty.call(i, r) && (t[r] = i[r])
            }
            return t
        }
        ),
        String.prototype.startsWith || (String.prototype.startsWith = function(e, t) {
            return t = t || 0,
            this.substr(t, e.length) === e
        }
        ),
        Element.prototype.matches || (Element.prototype.matches = Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function(e) {
            for (var t = (this.document || this.ownerDocument).querySelectorAll(e), n = t.length - 1; 0 <= --n && t.item(n) !== this; )
                ;
            return -1 < n
        }
        ),
        window.Element && !Element.prototype.closest && (Element.prototype.closest = function(e) {
            var t = (this.document || this.ownerDocument).querySelectorAll(e)
              , n = void 0
              , o = this;
            do {
                for (n = t.length; 0 <= --n && t.item(n) !== o; )
                    ;
            } while (n < 0 && (o = o.parentElement));
            return o
        }
        ),
        function() {
            for (var i = 0, e = ["ms", "moz", "webkit", "o"], t = 0; t < e.length && !window.requestAnimationFrame; ++t)
                window.requestAnimationFrame = window[e[t] + "RequestAnimationFrame"],
                window.cancelAnimationFrame = window[e[t] + "CancelAnimationFrame"] || window[e[t] + "CancelRequestAnimationFrame"];
            window.requestAnimationFrame || (window.requestAnimationFrame = function(e) {
                var t = (new Date).getTime()
                  , n = Math.max(0, 16 - (t - i))
                  , o = window.setTimeout(function() {
                    e(t + n)
                }, n);
                return i = t + n,
                o
            }
            ),
            window.cancelAnimationFrame || (window.cancelAnimationFrame = function(e) {
                clearTimeout(e)
            }
            )
        }(),
        /firefox/i.test(navigator.userAgent)) {
            var s = window.getComputedStyle;
            window.getComputedStyle = function(e, t) {
                var n = s(e, t);
                return null === n ? {
                    getPropertyValue: function() {}
                } : n
            }
        }
        window.Promise || (window.Promise = r.default),
        (o = window.Node || window.Element) && o.prototype && null === o.prototype.children && Object.defineProperty(o.prototype, "children", {
            get: function() {
                for (var e = 0, t = void 0, n = this.childNodes, o = []; t = n[e++]; )
                    1 === t.nodeType && o.push(t);
                return o
            }
        })
    }
    , {
        2: 2,
        5: 5
    }],
    32: [function(e, t, n) {
        "use strict";
        Object.defineProperty(n, "__esModule", {
            value: !0
        }),
        n.isDropFrame = C,
        n.secondsToTimeCode = a,
        n.timeCodeToSeconds = s,
        n.calculateTimeFormat = l,
        n.convertSMPTEtoSeconds = d;
        var o, i = e(9), r = (o = i) && o.__esModule ? o : {
            default: o
        };
        function C() {
            return !((0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : 25) % 1 == 0)
        }
        function a(e) {
            var t = 1 < arguments.length && void 0 !== arguments[1] && arguments[1]
              , n = 2 < arguments.length && void 0 !== arguments[2] && arguments[2]
              , o = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : 25
              , i = 4 < arguments.length && void 0 !== arguments[4] ? arguments[4] : 0
              , r = 5 < arguments.length && void 0 !== arguments[5] ? arguments[5] : "hh:mm:ss";
            e = !e || "number" != typeof e || e < 0 ? 0 : e;
            var a = Math.round(.066666 * o)
              , s = Math.round(o)
              , l = 24 * Math.round(3600 * o)
              , d = Math.round(600 * o)
              , u = C(o) ? ";" : ":"
              , c = void 0
              , f = void 0
              , p = void 0
              , m = void 0
              , h = Math.round(e * o);
            if (C(o)) {
                h < 0 && (h = l + h);
                var v = (h %= l) % d;
                h += 9 * a * Math.floor(h / d),
                a < v && (h += a * Math.floor((v - a) / Math.round(60 * s - a)));
                var y = Math.floor(h / s);
                c = Math.floor(Math.floor(y / 60) / 60),
                f = Math.floor(y / 60) % 60,
                p = n ? y % 60 : Math.floor(h / s % 60).toFixed(i)
            } else
                c = Math.floor(e / 3600) % 24,
                f = Math.floor(e / 60) % 60,
                p = n ? Math.floor(e % 60) : Math.floor(e % 60).toFixed(i);
            c = c <= 0 ? 0 : c,
            p = 60 === (p = p <= 0 ? 0 : p) ? 0 : p,
            f = 60 === (f = f <= 0 ? 0 : f) ? 0 : f;
            for (var g = r.split(":"), E = {}, b = 0, S = g.length; b < S; ++b) {
                for (var w = "", x = 0, T = g[b].length; x < T; x++)
                    w.indexOf(g[b][x]) < 0 && (w += g[b][x]);
                ~["f", "s", "m", "h"].indexOf(w) && (E[w] = g[b].length)
            }
            var P = t || 0 < c ? (c < 10 && 1 < E.h ? "0" + c : c) + ":" : "";
            return P += (f < 10 && 1 < E.m ? "0" + f : f) + ":",
            P += "" + (p < 10 && 1 < E.s ? "0" + p : p),
            n && (P += (m = (m = (h % s).toFixed(0)) <= 0 ? 0 : m) < 10 && E.f ? u + "0" + m : "" + u + m),
            P
        }
        function s(e) {
            var t = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : 25;
            if ("string" != typeof e)
                throw new TypeError("Time must be a string");
            if (0 < e.indexOf(";") && (e = e.replace(";", ":")),
            !/\d{2}(\:\d{2}){0,3}/i.test(e))
                throw new TypeError("Time code must have the format `00:00:00`");
            var n = e.split(":")
              , o = void 0
              , i = 0
              , r = 0
              , a = 0
              , s = 0
              , l = 0
              , d = Math.round(.066666 * t)
              , u = Math.round(t)
              , c = 3600 * u
              , f = 60 * u;
            switch (n.length) {
            default:
            case 1:
                a = parseInt(n[0], 10);
                break;
            case 2:
                r = parseInt(n[0], 10),
                a = parseInt(n[1], 10);
                break;
            case 3:
                i = parseInt(n[0], 10),
                r = parseInt(n[1], 10),
                a = parseInt(n[2], 10);
                break;
            case 4:
                i = parseInt(n[0], 10),
                r = parseInt(n[1], 10),
                a = parseInt(n[2], 10),
                s = parseInt(n[3], 10)
            }
            return o = C(t) ? c * i + f * r + u * a + s - d * ((l = 60 * i + r) - Math.floor(l / 10)) : (c * i + f * r + t * a + s) / t,
            parseFloat(o.toFixed(3))
        }
        function l(e, t) {
            var n = 2 < arguments.length && void 0 !== arguments[2] ? arguments[2] : 25;
            e = !e || "number" != typeof e || e < 0 ? 0 : e;
            for (var o = Math.floor(e / 3600) % 24, i = Math.floor(e / 60) % 60, r = Math.floor(e % 60), a = [[Math.floor((e % 1 * n).toFixed(3)), "f"], [r, "s"], [i, "m"], [o, "h"]], s = t.timeFormat, l = s[1] === s[0], d = l ? 2 : 1, u = s.length < d ? s[d] : ":", c = s[0], f = !1, p = 0, m = a.length; p < m; p++)
                if (~s.indexOf(a[p][1]))
                    f = !0;
                else if (f) {
                    for (var h = !1, v = p; v < m; v++)
                        if (0 < a[v][0]) {
                            h = !0;
                            break
                        }
                    if (!h)
                        break;
                    l || (s = c + s),
                    s = a[p][1] + u + s,
                    l && (s = a[p][1] + s),
                    c = a[p][1]
                }
            t.timeFormat = s
        }
        function d(e) {
            if ("string" != typeof e)
                throw new TypeError("Argument must be a string value");
            for (var t = ~(e = e.replace(",", ".")).indexOf(".") ? e.split(".")[1].length : 0, n = 0, o = 1, i = 0, r = (e = e.split(":").reverse()).length; i < r; i++)
                o = 1,
                0 < i && (o = Math.pow(60, i)),
                n += Number(e[i]) * o;
            return Number(n.toFixed(t))
        }
        r.default.Utils = r.default.Utils || {},
        r.default.Utils.secondsToTimeCode = a,
        r.default.Utils.timeCodeToSeconds = s,
        r.default.Utils.calculateTimeFormat = l,
        r.default.Utils.convertSMPTEtoSeconds = d
    }
    , {
        9: 9
    }]
}, {}, [31, 8, 7, 17, 25, 22, 21, 23, 24, 26, 18, 20, 19, 11, 12, 13, 14, 15, 16]);
;!function(e, a) {
    void 0 === mejs.plugins && (mejs.plugins = {},
    mejs.plugins.silverlight = [],
    mejs.plugins.silverlight.push({
        types: []
    })),
    mejs.HtmlMediaElementShim = mejs.HtmlMediaElementShim || {
        getTypeFromFile: mejs.Utils.getTypeFromFile
    },
    void 0 === mejs.MediaFeatures && (mejs.MediaFeatures = mejs.Features),
    void 0 === mejs.Utility && (mejs.Utility = mejs.Utils);
    var t = MediaElementPlayer.prototype.init;
    MediaElementPlayer.prototype.init = function() {
        this.options.classPrefix = "mejs-",
        this.$media = this.$node = a(this.node),
        t.call(this)
    }
    ;
    var i = MediaElementPlayer.prototype._meReady;
    MediaElementPlayer.prototype._meReady = function() {
        this.container = a(this.container),
        this.controls = a(this.controls),
        this.layers = a(this.layers),
        i.apply(this, arguments)
    }
    ,
    MediaElementPlayer.prototype.getElement = function(e) {
        return void 0 !== a && e instanceof a ? e[0] : e
    }
    ,
    MediaElementPlayer.prototype.buildfeatures = function(e, t, i, s) {
        for (var r = ["playpause", "current", "progress", "duration", "tracks", "volume", "fullscreen"], l = 0, n = this.options.features.length; l < n; l++) {
            var o = this.options.features[l];
            if (this["build" + o])
                try {
                    -1 === r.indexOf(o) ? this["build" + o](e, a(t), a(i), s) : this["build" + o](e, t, i, s)
                } catch (e) {
                    console.error("error building " + o, e)
                }
        }
    }
}(window, jQuery);
;(function(window, $) {
    window.wp = window.wp || {};
    mejs.plugins.silverlight[0].types.push('video/x-ms-wmv');
    mejs.plugins.silverlight[0].types.push('audio/x-ms-wma');
    function wpMediaElement() {
        var settings = {};
        function initialize() {
            if (typeof _wpmejsSettings !== 'undefined') {
                settings = $.extend(true, {}, _wpmejsSettings);
            }
            settings.success = settings.success || function(mejs, node, instance) {
                var autoplay, loop;
                if ('flash' === mejs.pluginType) {
                    autoplay = mejs.attributes.autoplay && 'false' !== mejs.attributes.autoplay;
                    loop = mejs.attributes.loop && 'false' !== mejs.attributes.loop;
                    autoplay && mejs.addEventListener('canplay', function() {
                        mejs.play();
                    }, false);
                    loop && mejs.addEventListener('ended', function() {
                        mejs.play();
                    }, false);
                }
                $(mejs).bind('resize', function() {
                    instance.globalResizeCallback();
                });
            }
            ;
            $('.wp-audio-shortcode, .wp-video-shortcode, .video-block video, .audio-block audio').not('.mejs-container').filter(function() {
                return !$(this).parent().hasClass('.mejs-mediaelement');
            }).mediaelementplayer(settings);
        }
        return {
            initialize: initialize
        };
    }
    window.wp.mediaelement = new wpMediaElement();
    $(window.wp.mediaelement.initialize);
}
)(window, jQuery);
;(function(factory) {
    if (typeof define !== 'undefined' && define.amd) {
        define([], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        window.scrollMonitor = factory();
    }
}
)(function() {
    var scrollTop = function() {
        return window.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
    };
    var exports = {};
    var watchers = [];
    var VISIBILITYCHANGE = 'visibilityChange';
    var ENTERVIEWPORT = 'enterViewport';
    var FULLYENTERVIEWPORT = 'fullyEnterViewport';
    var EXITVIEWPORT = 'exitViewport';
    var PARTIALLYEXITVIEWPORT = 'partiallyExitViewport';
    var LOCATIONCHANGE = 'locationChange';
    var STATECHANGE = 'stateChange';
    var eventTypes = [VISIBILITYCHANGE, ENTERVIEWPORT, FULLYENTERVIEWPORT, EXITVIEWPORT, PARTIALLYEXITVIEWPORT, LOCATIONCHANGE, STATECHANGE];
    var defaultOffsets = {
        top: 0,
        bottom: 0
    };
    var getViewportHeight = function() {
        return window.innerHeight || document.documentElement.clientHeight;
    };
    var getDocumentHeight = function() {
        return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, document.body.offsetHeight, document.documentElement.offsetHeight, document.documentElement.clientHeight);
    };
    exports.viewportTop = null;
    exports.viewportBottom = null;
    exports.documentHeight = null;
    exports.viewportHeight = getViewportHeight();
    var previousDocumentHeight;
    var latestEvent;
    var calculateViewportI;
    function calculateViewport() {
        exports.viewportTop = scrollTop();
        exports.viewportBottom = exports.viewportTop + exports.viewportHeight;
        exports.documentHeight = getDocumentHeight();
        if (exports.documentHeight !== previousDocumentHeight) {
            calculateViewportI = watchers.length;
            while (calculateViewportI--) {
                watchers[calculateViewportI].recalculateLocation();
            }
            previousDocumentHeight = exports.documentHeight;
        }
    }
    function recalculateWatchLocationsAndTrigger() {
        exports.viewportHeight = getViewportHeight();
        calculateViewport();
        updateAndTriggerWatchers();
    }
    var recalculateAndTriggerTimer;
    function debouncedRecalcuateAndTrigger() {
        clearTimeout(recalculateAndTriggerTimer);
        recalculateAndTriggerTimer = setTimeout(recalculateWatchLocationsAndTrigger, 100);
    }
    var updateAndTriggerWatchersI;
    function updateAndTriggerWatchers() {
        updateAndTriggerWatchersI = watchers.length;
        var i = 0;
        while (i < updateAndTriggerWatchersI) {
            watchers[i].update();
            i++;
        }
        updateAndTriggerWatchersI = watchers.length;
        var j = 0, newLength;
        while (j < updateAndTriggerWatchersI) {
            watchers[j].triggerCallbacks();
            newLength = watchers.length;
            if (newLength < updateAndTriggerWatchersI) {
                j -= updateAndTriggerWatchersI - newLength;
            }
            updateAndTriggerWatchersI = newLength;
            j++;
        }
    }
    function ElementWatcher(watchItem, offsets) {
        var self = this;
        this.watchItem = watchItem;
        this.uid = Math.random().toString(36).substring(8);
        if (!offsets) {
            this.offsets = defaultOffsets;
        } else if (offsets === +offsets) {
            this.offsets = {
                top: offsets,
                bottom: offsets
            };
        } else {
            this.offsets = {
                top: offsets.top || defaultOffsets.top,
                bottom: offsets.bottom || defaultOffsets.bottom
            };
        }
        this.callbacks = {};
        for (var i = 0, j = eventTypes.length; i < j; i++) {
            self.callbacks[eventTypes[i]] = [];
        }
        this.locked = false;
        var wasInViewport;
        var wasFullyInViewport;
        var wasAboveViewport;
        var wasBelowViewport;
        var listenerToTriggerListI;
        var listener;
        function triggerCallbackArray(listeners) {
            if (listeners.length === 0) {
                return;
            }
            listenerToTriggerListI = listeners.length;
            while (listenerToTriggerListI--) {
                listener = listeners[listenerToTriggerListI];
                listener.callback.call(self, latestEvent);
                if (listener.isOne) {
                    listeners.splice(listenerToTriggerListI, 1);
                }
            }
        }
        this.triggerCallbacks = function triggerCallbacks() {
            if (this.isInViewport && !wasInViewport) {
                triggerCallbackArray(this.callbacks[ENTERVIEWPORT]);
            }
            if (this.isFullyInViewport && !wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT]);
            }
            if (this.isAboveViewport !== wasAboveViewport && this.isBelowViewport !== wasBelowViewport) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE]);
                if (!wasFullyInViewport && !this.isFullyInViewport) {
                    triggerCallbackArray(this.callbacks[FULLYENTERVIEWPORT]);
                    triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT]);
                }
                if (!wasInViewport && !this.isInViewport) {
                    triggerCallbackArray(this.callbacks[ENTERVIEWPORT]);
                    triggerCallbackArray(this.callbacks[EXITVIEWPORT]);
                }
            }
            if (!this.isFullyInViewport && wasFullyInViewport) {
                triggerCallbackArray(this.callbacks[PARTIALLYEXITVIEWPORT]);
            }
            if (!this.isInViewport && wasInViewport) {
                triggerCallbackArray(this.callbacks[EXITVIEWPORT]);
            }
            if (this.isInViewport !== wasInViewport) {
                triggerCallbackArray(this.callbacks[VISIBILITYCHANGE]);
            }
            switch (true) {
            case wasInViewport !== this.isInViewport:
            case wasFullyInViewport !== this.isFullyInViewport:
            case wasAboveViewport !== this.isAboveViewport:
            case wasBelowViewport !== this.isBelowViewport:
                triggerCallbackArray(this.callbacks[STATECHANGE]);
            }
            wasInViewport = this.isInViewport;
            wasFullyInViewport = this.isFullyInViewport;
            wasAboveViewport = this.isAboveViewport;
            wasBelowViewport = this.isBelowViewport;
        }
        ;
        this.recalculateLocation = function() {
            if (this.locked) {
                return;
            }
            var previousTop = this.top;
            var previousBottom = this.bottom;
            if (this.watchItem.nodeName) {
                var cachedDisplay = this.watchItem.style.display;
                if (cachedDisplay === 'none') {
                    this.watchItem.style.display = '';
                }
                var boundingRect = this.watchItem.getBoundingClientRect();
                this.top = boundingRect.top + exports.viewportTop;
                this.bottom = boundingRect.bottom + exports.viewportTop;
                if (cachedDisplay === 'none') {
                    this.watchItem.style.display = cachedDisplay;
                }
            } else if (this.watchItem === +this.watchItem) {
                if (this.watchItem > 0) {
                    this.top = this.bottom = this.watchItem;
                } else {
                    this.top = this.bottom = exports.documentHeight - this.watchItem;
                }
            } else {
                this.top = this.watchItem.top;
                this.bottom = this.watchItem.bottom;
            }
            this.top -= this.offsets.top;
            this.bottom += this.offsets.bottom;
            this.height = this.bottom - this.top;
            if ((previousTop !== undefined || previousBottom !== undefined) && (this.top !== previousTop || this.bottom !== previousBottom)) {
                triggerCallbackArray(this.callbacks[LOCATIONCHANGE]);
            }
        }
        ;
        this.recalculateLocation();
        this.update();
        wasInViewport = this.isInViewport;
        wasFullyInViewport = this.isFullyInViewport;
        wasAboveViewport = this.isAboveViewport;
        wasBelowViewport = this.isBelowViewport;
    }
    ElementWatcher.prototype = {
        on: function(event, callback, isOne) {
            switch (true) {
            case event === VISIBILITYCHANGE && !this.isInViewport && this.isAboveViewport:
            case event === ENTERVIEWPORT && this.isInViewport:
            case event === FULLYENTERVIEWPORT && this.isFullyInViewport:
            case event === EXITVIEWPORT && this.isAboveViewport && !this.isInViewport:
            case event === PARTIALLYEXITVIEWPORT && this.isAboveViewport:
                callback.call(this, latestEvent);
                if (isOne) {
                    return;
                }
            }
            if (this.callbacks[event]) {
                this.callbacks[event].push({
                    callback: callback,
                    isOne: isOne || false
                });
            } else {
                throw new Error('Tried to add a scroll monitor listener of type ' + event + '. Your options are: ' + eventTypes.join(', '));
            }
        },
        off: function(event, callback) {
            if (this.callbacks[event]) {
                for (var i = 0, item; item = this.callbacks[event][i]; i++) {
                    if (item.callback === callback) {
                        this.callbacks[event].splice(i, 1);
                        break;
                    }
                }
            } else {
                throw new Error('Tried to remove a scroll monitor listener of type ' + event + '. Your options are: ' + eventTypes.join(', '));
            }
        },
        one: function(event, callback) {
            this.on(event, callback, true);
        },
        recalculateSize: function() {
            this.height = this.watchItem.offsetHeight + this.offsets.top + this.offsets.bottom;
            this.bottom = this.top + this.height;
        },
        update: function() {
            this.isAboveViewport = this.top < exports.viewportTop;
            this.isBelowViewport = this.bottom > exports.viewportBottom;
            this.isInViewport = (this.top <= exports.viewportBottom && this.bottom >= exports.viewportTop);
            this.isFullyInViewport = (this.top >= exports.viewportTop && this.bottom <= exports.viewportBottom) || (this.isAboveViewport && this.isBelowViewport);
        },
        destroy: function() {
            var index = -1
              , self = this;
            for (var i = 0; i < watchers.length; i++) {
                if (this.uid == watchers[i].uid) {
                    index = i;
                    break;
                }
            }
            if (index == -1) {
                index = watchers.indexOf(this);
            }
            watchers.splice(index, 1);
            for (var i = 0, j = eventTypes.length; i < j; i++) {
                self.callbacks[eventTypes[i]].length = 0;
            }
        },
        lock: function() {
            this.locked = true;
        },
        unlock: function() {
            this.locked = false;
        }
    };
    var eventHandlerFactory = function(type) {
        return function(callback, isOne) {
            this.on.call(this, type, callback, isOne);
        }
        ;
    };
    for (var i = 0, j = eventTypes.length; i < j; i++) {
        var type = eventTypes[i];
        ElementWatcher.prototype[type] = eventHandlerFactory(type);
    }
    try {
        calculateViewport();
    } catch (e) {
        try {
            window.$(calculateViewport);
        } catch (e) {
            throw new Error('If you must put scrollMonitor in the <head>, you must use jQuery.');
        }
    }
    function scrollMonitorListener(event) {
        latestEvent = event;
        calculateViewport();
        updateAndTriggerWatchers();
    }
    if (window.addEventListener) {
        window.addEventListener('scroll', scrollMonitorListener);
        window.addEventListener('resize', debouncedRecalcuateAndTrigger);
    } else {
        window.attachEvent('onscroll', scrollMonitorListener);
        window.attachEvent('onresize', debouncedRecalcuateAndTrigger);
    }
    exports.beget = exports.create = function(element, offsets) {
        if (typeof element === 'string') {
            element = document.querySelector(element);
        } else if (element && element.length > 0) {
            element = element[0];
        }
        var watcher = new ElementWatcher(element,offsets);
        watchers.push(watcher);
        watcher.update();
        return watcher;
    }
    ;
    exports.update = function() {
        latestEvent = null;
        calculateViewport();
        updateAndTriggerWatchers();
    }
    ;
    exports.recalculateLocations = function() {
        exports.documentHeight = 0;
        exports.update();
    }
    ;
    return exports;
});
;(function($) {
    $(function() {
        function gallery_images_loaded($box, image_selector, callback) {
            function check_image_loaded(img) {
                return img.complete && img.naturalWidth !== undefined && img.naturalWidth != 0;
            }
            var $images = $(image_selector, $box).filter(function() {
                return !check_image_loaded(this);
            })
              , images_count = $images.length;
            if (images_count == 0) {
                return callback();
            }
            if (window.gemBrowser.name == 'ie' && !isNaN(parseInt(window.gemBrowser.version)) && parseInt(window.gemBrowser.version) <= 10) {
                function image_load_event() {
                    images_count--;
                    if (images_count == 0) {
                        callback();
                    }
                }
                $images.each(function() {
                    if (check_image_loaded(this)) {
                        return;
                    }
                    var proxyImage = new Image();
                    proxyImage.addEventListener('load', image_load_event);
                    proxyImage.addEventListener('error', image_load_event);
                    proxyImage.src = this.src;
                });
                return;
            }
            $images.on('load error', function() {
                images_count--;
                if (images_count == 0) {
                    callback();
                }
            });
        }
        function init_circular_overlay($gallery, $set) {
            if (!$gallery.hasClass('hover-circular')) {
                return;
            }
            $('.gallery-item', $set).on('mouseenter', function() {
                var overlayWidth = $('.overlay', this).width()
                  , overlayHeight = $('.overlay', this).height()
                  , $overlayCircle = $('.overlay-circle', this)
                  , maxSize = 0;
                if (overlayWidth > overlayHeight) {
                    maxSize = overlayWidth;
                    $overlayCircle.height(overlayWidth)
                } else {
                    maxSize = overlayHeight;
                    $overlayCircle.width(overlayHeight);
                }
                maxSize += overlayWidth * 0.3;
                $overlayCircle.css({
                    marginLeft: -maxSize / 2,
                    marginTop: -maxSize / 2
                });
            });
        }
        function initGalleryGrid() {
            if ($(this).hasClass('metro')) {
                return;
            }
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initGalleryGrid.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $gallery = $(this);
            var $set = $('.gallery-set', this);
            gallery_images_loaded($set, '.image-wrap img', function() {
                $gallery.closest('.gallery-preloader-wrapper').prev('.preloader').remove();
                init_circular_overlay($gallery, $set);
                var itemsAnimations = $gallery.itemsAnimations({
                    itemSelector: '.gallery-item',
                    scrollMonitor: true
                });
                var init_gallery = true;
                $set.on('arrangeComplete', function(event, filteredItems) {
                    if (init_gallery) {
                        init_gallery = false;
                        var items = [];
                        filteredItems.forEach(function(item) {
                            items.push(item.element);
                        });
                        itemsAnimations.show($(items));
                    }
                }).isotope({
                    itemSelector: '.gallery-item',
                    itemImageWrapperSelector: '.image-wrap',
                    fixHeightDoubleItems: $gallery.hasClass('gallery-style-justified'),
                    layoutMode: 'masonry-custom',
                    'masonry-custom': {
                        columnWidth: '.gallery-item:not(.double-item)'
                    }
                });
            });
            if ($set.closest('.gem_tab').size() > 0) {
                $set.closest('.gem_tab').bind('tab-update', function() {
                    $set.isotope('layout');
                });
            }
            $(document).on('show.vc.tab', '[data-vc-tabs]', function() {
                var $tab = $(this).data('vc.tabs').getTarget();
                if ($tab.find($set).length) {
                    $set.isotope('layout');
                }
            });
        }
        var resizeTimer = null;
        function initGalleryMetroGrid() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initGalleryMetroGrid.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $gallery = $(this);
            var $set = $('.gallery-set', this);
            gallery_images_loaded($set, '.image-wrap img', function() {
                $gallery.closest('.gallery-preloader-wrapper').prev('.preloader').remove();
                var itemsAnimations = $gallery.itemsAnimations({
                    itemSelector: '.gallery-item',
                    scrollMonitor: true
                });
                var init_gallery = true;
                init_circular_overlay($gallery, $set);
                $set.on('arrangeComplete', function(event, filteredItems) {
                    if (init_gallery) {
                        init_gallery = false;
                        var items = [];
                        filteredItems.forEach(function(item) {
                            items.push(item.element);
                        });
                        itemsAnimations.show($(items));
                    }
                }).isotope({
                    itemSelector: '.gallery-item',
                    itemImageWrapperSelector: '.image-wrap',
                    fixHeightDoubleItems: $gallery.hasClass('gallery-style-justified'),
                    layoutMode: 'metro',
                    'masonry-custom': {
                        columnWidth: '.gallery-item:not(.double-item)'
                    },
                    transitionDuration: 0
                });
                if ($set.closest('.gem_tab').size() > 0) {
                    $set.closest('.gem_tab').bind('tab-update', function() {
                        $set.isotope('layout');
                    });
                }
                $(document).on('gem.show.vc.tabs', '[data-vc-accordion]', function() {
                    var $tab = $(this).data('vc.accordion').getTarget();
                    if ($tab.find($set).length) {
                        $set.isotope('layout');
                    }
                });
                $(document).on('gem.show.vc.accordion', '[data-vc-accordion]', function() {
                    var $tab = $(this).data('vc.accordion').getTarget();
                    if ($tab.find($set).length) {
                        $set.isotope('layout');
                    }
                });
            });
        }
        function initGallerySlider() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initGallerySlider.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $gallery = $(this);
            var $set = $('.gallery-set', this);
            var $items = $('.gallery-item', $set);
            init_circular_overlay($gallery, $set);
            $set.wrap('<div class="gem-gallery-preview-carousel-wrap clearfix"/>');
            var $galleryPreviewWrap = $('.gem-gallery-preview-carousel-wrap', this);
            $galleryPreviewWrap.wrap('<div class="gem-gallery-preview-carousel-padding clearfix"/>');
            var $galleryPreviewNavigation = $('<div class="gem-gallery-preview-navigation"/>').appendTo($galleryPreviewWrap);
            var $galleryPreviewPrev = $('<a href="#" class="gem-prev gem-gallery-preview-prev"></a>').appendTo($galleryPreviewNavigation);
            var $galleryPreviewNext = $('<a href="#" class="gem-next gem-gallery-preview-next"></a>').appendTo($galleryPreviewNavigation);
            var $galleryThumbsWrap = $('<div class="gem-gallery-thumbs-carousel-wrap col-lg-12 col-md-12 col-sm-12 clearfix" style="opacity: 0"/>').appendTo($gallery);
            var $galleryThumbsCarousel = $('<ul class="gem-gallery-thumbs-carousel"/>').appendTo($galleryThumbsWrap);
            var $galleryThumbsNavigation = $('<div class="gem-gallery-thumbs-navigation"/>').appendTo($galleryThumbsWrap);
            var $galleryThumbsPrev = $('<a href="#" class="gem-prev gem-gallery-thumbs-prev"></a>').appendTo($galleryThumbsNavigation);
            var $galleryThumbsNext = $('<a href="#" class="gem-next gem-gallery-thumbs-next"></a>').appendTo($galleryThumbsNavigation);
            var thumbItems = '';
            $items.each(function() {
                thumbItems += '<li><span><img src="' + $('.image-wrap img', this).data('thumb-url') + '" alt="" /></span></li>';
            });
            var $thumbItems = $(thumbItems);
            $thumbItems.appendTo($galleryThumbsCarousel);
            $thumbItems.each(function(index) {
                $(this).data('gallery-item-num', index);
            });
            var $galleryPreview = $set.carouFredSel({
                auto: false,
                circular: false,
                infinite: false,
                responsive: true,
                width: '100%',
                height: '100%',
                items: 1,
                align: 'center',
                prev: $galleryPreviewPrev,
                next: $galleryPreviewNext,
                swipe: true,
                scroll: {
                    items: 1,
                    onBefore: function(data) {
                        var current = $(this).triggerHandler('currentPage');
                        var thumbCurrent = $galleryThumbs.triggerHandler('slice', [current, current + 1]);
                        var thumbsVisible = $galleryThumbs.triggerHandler('currentVisible');
                        $thumbItems.filter('.active').removeClass('active');
                        if (thumbsVisible.index(thumbCurrent) === -1) {
                            $galleryThumbs.trigger('slideTo', current);
                        }
                        $('span', thumbCurrent).trigger('click');
                    }
                }
            });
            var $galleryThumbs = null;
            gallery_images_loaded($galleryThumbsCarousel, 'img', function() {
                $galleryThumbs = $galleryThumbsCarousel.carouFredSel({
                    auto: false,
                    circular: false,
                    infinite: false,
                    width: '100%',
                    height: 'variable',
                    align: 'center',
                    prev: $galleryThumbsPrev,
                    next: $galleryThumbsNext,
                    swipe: true,
                    onCreate: function(data) {
                        $('span', $thumbItems).click(function(e) {
                            e.preventDefault();
                            $thumbItems.filter('.active').removeClass('active');
                            $(this).closest('li').addClass('active');
                            $galleryPreview.trigger('slideTo', $(this).closest('li').data('gallery-item-num'));
                        });
                        $thumbItems.eq(0).addClass('active');
                    }
                });
                $galleryThumbsWrap.animate({
                    opacity: 1
                }, 400);
                if ($thumbItems.length < 2) {
                    $galleryThumbsWrap.hide();
                }
            });
        }
        function initGallery() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initGallery.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $galleryElement = $(this);
            var $thumbItems = $('.gem-gallery-item', $galleryElement);
            var $galleryPreviewWrap = $('<div class="gem-gallery-preview-carousel-wrap"/>').appendTo($galleryElement);
            var $galleryPreviewCarousel = $('<div class="gem-gallery-preview-carousel "/>').appendTo($galleryPreviewWrap);
            var $galleryPreviewNavigation = $('<div class="gem-gallery-preview-navigation"/>').appendTo($galleryPreviewWrap);
            var $galleryPreviewPrev = $('<a href="#" class="gem-prev gem-gallery-preview-prev"></a>').appendTo($galleryPreviewNavigation);
            var $galleryPreviewNext = $('<a href="#" class="gem-next gem-gallery-preview-next"></a>').appendTo($galleryPreviewNavigation);
            if ($galleryElement.hasClass('with-pagination')) {
                var $galleryPreviewPagination = $('<div class="gem-gallery-preview-pagination gem-mini-pagination"/>').appendTo($galleryPreviewWrap);
            }
            var $previewItems = $thumbItems.clone(true, true);
            $previewItems.appendTo($galleryPreviewCarousel);
            $previewItems.each(function() {
                $('img', this).attr('src', $('a', this).attr('href'));
                $('a', this).attr('href', $('a', this).data('full-image-url')).attr('data-fancybox', $('a', this).data('fancybox-group')).addClass('fancy-gallery');
            });
            $galleryPreviewCarousel.initGalleryFancybox();
            var $galleryThumbsWrap = $('<div class="gem-gallery-thumbs-carousel-wrap"/>').appendTo($galleryElement);
            var $galleryThumbsCarousel = $('<div class="gem-gallery-thumbs-carousel"/>').appendTo($galleryThumbsWrap);
            var $galleryThumbsNavigation = $('<div class="gem-gallery-thumbs-navigation"/>').appendTo($galleryThumbsWrap);
            var $galleryThumbsPrev = $('<a href="#" class="gem-prev gem-gallery-thumbs-prev"></a>').appendTo($galleryThumbsNavigation);
            var $galleryThumbsNext = $('<a href="#" class="gem-next gem-gallery-thumbs-next"></a>').appendTo($galleryThumbsNavigation);
            $thumbItems.appendTo($galleryThumbsCarousel);
            $thumbItems.each(function(index) {
                $(this).data('gallery-item-num', index);
            });
        }
        $('.gem-gallery-grid').not('.gallery-slider').each(initGalleryGrid);
        $('.gem-gallery-grid.metro').not('.gallery-slider').each(initGalleryMetroGrid);
        $('.gallery-slider').each(initGallerySlider);
        $('.gem-gallery-grid').on('click', '.gallery-item', function() {
            $(this).mouseover();
        });
        $('.gem-gallery').each(initGallery);
        $('body').updateGalleries();
        $('body').buildSimpleGalleries();
        $('body').updateSimpleGalleries();
        $('.gem_tab').on('tab-update', function() {
            $(this).updateGalleries();
        });
        $(document).on('gem.show.vc.tabs', '[data-vc-accordion]', function() {
            $(this).data('vc.accordion').getTarget().updateGalleries();
        });
        $(document).on('gem.show.vc.accordion', '[data-vc-accordion]', function() {
            $(this).data('vc.accordion').getTarget().updateGalleries();
        });
    });
    function updateGallery() {
        if (window.tgpLazyItems !== undefined) {
            var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                updateGallery.call(node);
            });
            if (!isShowed) {
                return;
            }
        }
        var $galleryElement = $(this);
        var $galleryPreviewCarousel = $('.gem-gallery-preview-carousel', $galleryElement);
        var $galleryThumbsWrap = $('.gem-gallery-thumbs-carousel-wrap', $galleryElement);
        var $galleryThumbsCarousel = $('.gem-gallery-thumbs-carousel', $galleryElement);
        var $thumbItems = $('.gem-gallery-item', $galleryThumbsCarousel);
        var $galleryPreviewPrev = $('.gem-gallery-preview-prev', $galleryElement);
        var $galleryPreviewNext = $('.gem-gallery-preview-next', $galleryElement);
        var $galleryPreviewPagination = $('.gem-gallery-preview-pagination', $galleryElement);
        var $galleryThumbsPrev = $('.gem-gallery-thumbs-prev', $galleryElement);
        var $galleryThumbsNext = $('.gem-gallery-thumbs-next', $galleryElement);
        $galleryElement.thegemPreloader(function() {
            var $galleryThumbs = $galleryThumbsCarousel
              , $galleryPreview = $galleryPreviewCarousel;
            $galleryPreview = $galleryPreviewCarousel.carouFredSel({
                auto: $galleryElement.data('autoscroll') ? $galleryElement.data('autoscroll') : false,
                circular: true,
                infinite: true,
                responsive: true,
                width: '100%',
                height: 'auto',
                items: 1,
                align: 'center',
                prev: $galleryPreviewPrev,
                next: $galleryPreviewNext,
                pagination: $galleryElement.hasClass('with-pagination') ? $galleryPreviewPagination : false,
                swipe: true,
                scroll: {
                    pauseOnHover: true,
                    items: 1,
                    onBefore: function(data) {
                        var current = $(this).triggerHandler('currentPage');
                        var thumbCurrent = $galleryThumbs.triggerHandler('slice', [current, current + 1]);
                        var thumbsVisible = $galleryThumbs.triggerHandler('currentVisible');
                        $thumbItems.filter('.active').removeClass('active');
                        if (thumbsVisible.index(thumbCurrent) === -1) {
                            $galleryThumbs.trigger('slideTo', current);
                        }
                        $('a', thumbCurrent).trigger('gemActivate');
                    }
                },
                onCreate: function() {
                    $(window).on('resize', function() {
                        $galleryPreviewCarousel.parent().add($galleryPreviewCarousel).height($galleryPreviewCarousel.children().first().height());
                    }).trigger('resize');
                }
            });
            $galleryThumbs = $galleryThumbsCarousel.carouFredSel({
                auto: false,
                circular: true,
                infinite: true,
                width: '100%',
                height: 'variable',
                align: 'center',
                prev: $galleryThumbsPrev,
                next: $galleryThumbsNext,
                swipe: true,
                onCreate: function(data) {
                    $('a', $thumbItems).on('gemActivate', function(e) {
                        $thumbItems.filter('.active').removeClass('active');
                        $(this).closest('.gem-gallery-item').addClass('active');
                        $galleryPreview.trigger('slideTo', $(this).closest('.gem-gallery-item').data('gallery-item-num'));
                    });
                    $('a', $thumbItems).click(function(e) {
                        e.preventDefault();
                        $(this).trigger('gemActivate');
                    });
                }
            });
            if ($thumbItems.filter('.active').length) {
                $thumbItems.filter('.active').eq(0).find('a').trigger('click');
            } else {
                $thumbItems.eq(0).find('a').trigger('gemActivate');
            }
            if ($thumbItems.length < 2) {
                $galleryThumbsWrap.hide();
            }
        });
    }
    function updateSimpleGallery() {
        if (window.tgpLazyItems !== undefined) {
            var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                updateSimpleGallery.call(node);
            });
            if (!isShowed) {
                return;
            }
        }
        var $galleryElement = $(this);
        var $galleryItemsCarousel = $('.gem-gallery-items-carousel', $galleryElement);
        var $thumbItems = $('.gem-gallery-item', $galleryItemsCarousel);
        var $galleryItemsPrev = $('.gem-gallery-items-prev', $galleryElement);
        var $galleryItemsNext = $('.gem-gallery-items-next', $galleryElement);
        $galleryElement.thegemPreloader(function() {
            var $galleryItems = $galleryItemsCarousel.carouFredSel({
                auto: ($galleryElement.data('autoscroll') > 0 ? $galleryElement.data('autoscroll') : false),
                circular: true,
                infinite: true,
                responsive: $galleryElement.hasClass('responsive'),
                width: '100%',
                height: 'variable',
                align: 'center',
                prev: $galleryItemsPrev,
                next: $galleryItemsNext,
                swipe: true,
                scroll: {
                    pauseOnHover: true
                },
                onCreate: function(data) {
                    $galleryElement.trigger('gallery-inited');
                }
            });
        });
    }
    $.fn.buildSimpleGalleries = function() {
        $('.gem-simple-gallery:not(.activated)', this).each(function() {
            var $galleryElement = $(this);
            $galleryElement.addClass('activated');
            var $thumbItems = $('.gem-gallery-item', $galleryElement);
            var $galleryItemsWrap = $('<div class="gem-gallery-items-carousel-wrap"/>').appendTo($galleryElement);
            var $galleryItemsCarousel = $('<div class="gem-gallery-items-carousel"/>').appendTo($galleryItemsWrap);
            var $galleryItemsNavigation = $('<div class="gem-gallery-items-navigation"/>').appendTo($galleryItemsWrap);
            var $galleryItemsPrev = $('<a href="#" class="gem-prev gem-gallery-items-prev"></a>').appendTo($galleryItemsNavigation);
            var $galleryItemsNext = $('<a href="#" class="gem-next gem-gallery-items-next"></a>').appendTo($galleryItemsNavigation);
            $thumbItems.appendTo($galleryItemsCarousel);
            $('a', $galleryItemsCarousel).addClass('fancy-gallery');
            $galleryItemsCarousel.initGalleryFancybox();
        });
    }
    $.fn.updateGalleries = function() {
        $('.gem-gallery', this).each(updateGallery);
    }
    $.fn.updateSimpleGalleries = function() {
        $('.gem-simple-gallery', this).each(updateSimpleGallery);
    }
}
)(jQuery);
;(function($) {
    var animations = {
        'move-up': {
            timeout: 200
        },
        bounce: {
            timeout: 100
        },
        'fade-in': {
            timeout: 100
        },
        scale: {
            timeout: 100
        },
        flip: {
            timeout: 100
        },
        'fall-perspective': {
            timeout: 100
        },
    };
    var prefixes = 'Webkit Moz ms Ms O'.split(' ');
    var docElemStyle = document.documentElement.style;
    function getStyleProperty(propName) {
        if (!propName) {
            return;
        }
        if (typeof docElemStyle[propName] === 'string') {
            return propName;
        }
        propName = propName.charAt(0).toUpperCase() + propName.slice(1);
        var prefixed;
        for (var i = 0, len = prefixes.length; i < len; i++) {
            prefixed = prefixes[i] + propName;
            if (typeof docElemStyle[prefixed] === 'string') {
                return prefixed;
            }
        }
    }
    var transitionProperty = getStyleProperty('transition');
    var transitionEndEvent = {
        WebkitTransition: 'webkitTransitionEnd',
        MozTransition: 'transitionend',
        OTransition: 'otransitionend',
        transition: 'transitionend'
    }[transitionProperty];
    function ItemsAnimations(el, options) {
        var self = this;
        this.el = el;
        this.$el = $(el);
        this.options = {
            itemSelector: '',
            scrollMonitor: false,
            firstItemStatic: false
        };
        $.extend(this.options, options);
        this.$el.data('itemsAnimations', this);
        self.initialize();
    }
    $.fn.itemsAnimations = function(options) {
        if (typeof options === 'string') {
            var instance = $(this.get(0)).data('itemsAnimations');
            if (!instance) {
                return false;
            }
            if (options === 'instance') {
                return instance;
            }
        } else {
            return new ItemsAnimations(this.get(0),options);
        }
    }
    ItemsAnimations.prototype = {
        initialize: function() {
            var self = this;
            this.queue = [];
            this.queue_is_run = false;
            this.watchers = {};
            this.animation = this.getAnimation();
            if (!this.animation || $(window).width() < 767) {
                this.animationName = 'disabled';
                this.animation = this.getAnimationByName('disabled');
            }
            if (this.options.firstItemStatic) {
                this.firstStatisItem = $(this.options.itemSelector + ':first', this.$el);
                this.firstStatisItem.removeClass('item-animations-not-inited');
            }
            if (this.animationName == 'disabled') {
                $(this.options.itemSelector, this.$el).removeClass('item-animations-not-inited');
            }
        },
        initTimer: function() {
            var self = this;
            this.timer = document.createElement('div');
            this.timer.className = 'items-animations-timer-element';
            if (this.animation.timeout > 0) {
                this.timer.setAttribute("style", "transition-duration: " + this.animation.timeout + "ms; -webkit-transition-duration: " + this.animation.timeout + "ms; -moz-transition-duration: " + this.animation.timeout + "ms; -o-transition-duration: " + this.animation.timeout + "ms;");
            }
            document.body.appendChild(this.timer);
            this.timerCallback = function() {}
            ;
            $(this.timer).bind(transitionEndEvent, function(event) {
                self.timerCallback();
            });
            this.timer.className += ' start-timer';
        },
        startTimer: function(callback) {
            setTimeout(callback, this.animation.timeout);
        },
        startTimerOld: function(callback) {
            this.timerCallback = callback;
            if (this.timer.className.indexOf('start-timer') != -1) {
                this.timer.className = this.timer.className.replace(' start-timer', '');
            } else {
                this.timer.className += ' start-timer';
            }
        },
        show: function($items, forceUseScrollMonitor) {
            var self = this;
            if (forceUseScrollMonitor === undefined) {
                forceUseScrollMonitor = false;
            }
            if (this.animationName == 'disabled') {
                $(this.options.itemSelector, this.$el).removeClass('item-animations-not-inited');
                return false;
            }
            if ($items == undefined) {
                $items = $(this.options.itemSelector, this.$el);
            }
            $items.not('.item-animations-inited').each(function(index) {
                var $this = $(this);
                if (self.options.firstItemStatic && self.firstStatisItem && self.firstStatisItem.get(0) == this) {
                    $this.addClass('item-animations-inited');
                    return;
                }
                $this.addClass('item-animations-inited');
                if ((self.options.scrollMonitor || forceUseScrollMonitor) && window.scrollMonitor !== undefined && this.animationName != 'disabled') {
                    var watcher = scrollMonitor.create(this, -50);
                    watcher.enterViewport(function() {
                        var watcher = this;
                        self.showItem($this, watcher);
                    });
                    self.watchers[watcher.uid] = watcher;
                } else {
                    self.showItem($this);
                }
            });
            $(this.options.itemSelector, this.$el).not('.item-animations-inited').removeClass('item-animations-not-inited');
        },
        reinitItems: function($items) {
            $items.removeClass('start-animation item-animations-inited item-animations-loading before-start').addClass('item-animations-not-inited');
            this.clear();
        },
        getAnimationName: function() {
            var m = this.$el[0].className.match(/item-animation-(\S+)/);
            if (!m) {
                return '';
            }
            return m[1];
        },
        getAnimation: function() {
            this.animationName = this.getAnimationName();
            return this.getAnimationByName(this.animationName);
        },
        getAnimationByName: function(name) {
            if (!name || animations[name] == undefined) {
                return false;
            }
            return animations[name];
        },
        showItem: function($item, watcher) {
            var self = this;
            if ($item.hasClass('item-animations-loading')) {
                return false;
            }
            $item.addClass('before-start');
            function showItemCallback() {
                if ($item.length == 0) {
                    return false;
                }
                self.animate($item);
                if (watcher != undefined) {
                    self.destroyWatcher(watcher);
                }
            }
            $item.addClass('item-animations-loading');
            if (this.animation.timeout > 0) {
                this.queueAdd(showItemCallback, this.animation.timeout);
            } else {
                showItemCallback();
            }
        },
        destroyWatcher: function(watcher) {
            if (this.watchers[watcher.uid] != undefined) {
                delete this.watchers[watcher.uid];
            }
            watcher.destroy();
        },
        animate: function($item, animation) {
            $item.bind(transitionEndEvent, function(event) {
                var target = event.target || event.srcElement;
                if (target != $item[0]) {
                    return;
                }
                $item.unbind(transitionEndEvent);
                $item.removeClass('before-start start-animation');
            });
            $item.removeClass('item-animations-loading item-animations-not-inited').addClass('start-animation');
        },
        queueAdd: function(callback, timeout) {
            var self = this;
            this.queue.push({
                callback: callback,
                timeout: timeout
            });
            if (this.queue.length == 1 && !this.queue_is_run) {
                this.startTimer(function() {
                    self.queueNext();
                });
            }
        },
        queueNext: function() {
            var self = this;
            if (this.queue.length == 0) {
                return false;
            }
            var next_action = this.queue.shift();
            if (next_action == undefined) {
                return false;
            }
            this.queue_is_run = true;
            next_action.callback();
            this.startTimer(function() {
                self.queue_is_run = false;
                self.queueNext();
            });
        },
        clear: function() {
            this.queue = [];
            this.queue_is_run = false;
            for (var watcher_uid in this.watchers) {
                if (this.watchers.hasOwnProperty(watcher_uid)) {
                    this.destroyWatcher(this.watchers[watcher_uid]);
                }
            }
            this.watchers = [];
        }
    };
}
)(jQuery);
;(function($) {
    window.thegemBlogImagesLoaded = function($box, image_selector, callback) {
        function check_image_loaded(img) {
            return img.complete && img.naturalWidth !== undefined && img.naturalWidth != 0;
        }
        var $images = $(image_selector, $box).filter(function() {
            return !check_image_loaded(this);
        })
          , images_count = $images.length;
        if (images_count == 0) {
            return callback();
        }
        if (window.gemBrowser.name == 'ie' && !isNaN(parseInt(window.gemBrowser.version)) && parseInt(window.gemBrowser.version) <= 10) {
            function image_load_event() {
                images_count--;
                if (images_count == 0) {
                    callback();
                }
            }
            $images.each(function() {
                if (check_image_loaded(this)) {
                    return;
                }
                var proxyImage = new Image();
                proxyImage.addEventListener('load', image_load_event);
                proxyImage.addEventListener('error', image_load_event);
                proxyImage.src = this.src;
            });
            return;
        }
        $images.on('load error', function() {
            images_count--;
            if (images_count == 0) {
                callback();
            }
        });
    }
    window.thegemInitBlogScrollNextPage = function($blog, $pagination) {
        if (!$pagination.length) {
            return false;
        }
        var watcher = scrollMonitor.create($pagination[0]);
        watcher.enterViewport(function() {
            window.thegemBlogLoadMoreRequest($blog, $pagination, true);
        });
    }
    function finishAjaxRequestActions($blog, $inserted_data, is_scroll, $pagination, next_page, $loading_marker) {
        $inserted_data.buildSimpleGalleries();
        $inserted_data.updateSimpleGalleries();
        window.wp.mediaelement.initialize();
        $blog.itemsAnimations('instance').show($inserted_data);
        if ($blog.hasClass('blog-style-justified-2x') || $blog.hasClass('blog-style-justified-3x') || $blog.hasClass('blog-style-justified-4x')) {
            window.thegemBlogImagesLoaded($blog, 'article img', function() {
                window.thegemBlogOneSizeArticles($blog);
            });
        }
        if (is_scroll) {
            $pagination.removeClass('active').html('');
        } else {
            $loading_marker.remove();
            if (next_page == 0) {
                $pagination.hide();
            }
        }
        $blog.data('request-process', false).data('next-page', next_page);
    }
    window.thegemBlogLoadMoreRequest = function($blog, $pagination, is_scroll) {
        var data = thegem_blog_ajax;
        var is_processing_request = $blog.data('request-process') || false;
        if (is_processing_request) {
            return false;
        }
        var paged = $blog.data('next-page');
        if (paged == null || paged == undefined) {
            paged = 1;
        }
        if (paged == 0) {
            return false;
        }
        data['data']['paged'] = paged;
        data['action'] = 'blog_load_more';
        $blog.data('request-process', true);
        if (is_scroll) {
            $pagination.addClass('active').html('<div class="loading"><div class="preloader-spin"></div></div>');
        } else {
            var $loading_marker = $('<div class="loading"><div class="preloader-spin"></div></div>');
            $('.gem-button-container', $pagination).before($loading_marker);
        }
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: thegem_blog_ajax.url,
            data: data,
            success: function(response) {
                if (response.status == 'success') {
                    var $newItems = $(response.html)
                      , $inserted_data = $($newItems.html())
                      , current_page = $newItems.data('page')
                      , next_page = $newItems.data('next-page');
                    if ($blog.hasClass('blog-style-masonry') || $blog.hasClass('blog-style-timeline_new')) {
                        window.thegemBlogImagesLoaded($newItems, 'article img', function() {
                            $blog.isotope('insert', $inserted_data);
                            finishAjaxRequestActions($blog, $inserted_data, is_scroll, $pagination, next_page, $loading_marker);
                        });
                    } else {
                        $blog.append($inserted_data);
                        finishAjaxRequestActions($blog, $inserted_data, is_scroll, $pagination, next_page, $loading_marker);
                    }
                    $blog.initBlogFancybox();
                } else {
                    alert(response.message);
                }
            }
        });
    }
    window.thegemBlogOneSizeArticles = function($blog) {
        var elements = {};
        $("article", $blog).css('height', '');
        $("article", $blog).each(function(i, e) {
            var transform = $(this).css('transform');
            var translateY = 0;
            if (transform != undefined && transform != 'none') {
                translateY = parseFloat(transform.substr(1, transform.length - 2).split(',')[5]);
                if (isNaN(translateY)) {
                    translateY = 0;
                }
            }
            var elPosition = parseInt($(this).position().top - translateY);
            var elHeight = $(this).height();
            if (elements[elPosition] == undefined) {
                elements[elPosition] = {
                    'array': [$(this)],
                    'maxHeight': elHeight
                };
            } else {
                elements[elPosition]['array'].push($(this));
                if (elements[elPosition]['maxHeight'] < elHeight) {
                    elements[elPosition]['maxHeight'] = elHeight;
                }
            }
        });
        $.each(elements, function(i, e) {
            var item = this;
            $.each(item.array, function() {
                $(this).height(item.maxHeight);
            });
        });
    }
}
)(jQuery);
;(function($) {
    function initBlogDefault() {
        if (window.tgpLazyItems !== undefined) {
            var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                initBlogDefault.call(node);
            });
            if (!isShowed) {
                return;
            }
        }
        var $blog = $(this);
        $('.blog-load-more', $blog.parent()).on('click', function() {
            window.thegemBlogLoadMoreRequest($blog, $(this), false);
        });
        window.thegemInitBlogScrollNextPage($blog, $blog.siblings('.blog-scroll-pagination'));
        var itemsAnimations = $blog.itemsAnimations({
            itemSelector: 'article',
            scrollMonitor: true
        });
        itemsAnimations.show();
        window.thegemBlogImagesLoaded($blog, 'article img', function() {
            if ($blog.hasClass('blog-style-justified-2x') || $blog.hasClass('blog-style-justified-3x') || $blog.hasClass('blog-style-justified-4x')) {
                window.thegemBlogOneSizeArticles($blog);
            }
            $blog.buildSimpleGalleries();
            $blog.updateSimpleGalleries();
        });
    }
    $('.blog:not(body,.blog-style-timeline_new,.blog-style-masonry)').each(initBlogDefault);
    $(window).on('resize', function() {
        $(".blog-style-justified-2x, .blog-style-justified-3x, .blog-style-justified-4x").each(function() {
            window.thegemBlogOneSizeArticles($(this));
        });
    });
}
)(jQuery);
;/*!
 * Isotope PACKAGED v2.2.2
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * http://isotope.metafizzy.co
 * Copyright 2015 Metafizzy
 */

!function(a) {
    function b() {}
    function c(a) {
        function c(b) {
            b.prototype.option || (b.prototype.option = function(b) {
                a.isPlainObject(b) && (this.options = a.extend(!0, this.options, b))
            }
            )
        }
        function e(b, c) {
            a.fn[b] = function(e) {
                if ("string" == typeof e) {
                    for (var g = d.call(arguments, 1), h = 0, i = this.length; i > h; h++) {
                        var j = this[h]
                          , k = a.data(j, b);
                        if (k)
                            if (a.isFunction(k[e]) && "_" !== e.charAt(0)) {
                                var l = k[e].apply(k, g);
                                if (void 0 !== l)
                                    return l
                            } else
                                f("no such method '" + e + "' for " + b + " instance");
                        else
                            f("cannot call methods on " + b + " prior to initialization; attempted to call '" + e + "'")
                    }
                    return this
                }
                return this.each(function() {
                    var d = a.data(this, b);
                    d ? (d.option(e),
                    d._init()) : (d = new c(this,e),
                    a.data(this, b, d))
                })
            }
        }
        if (a) {
            var f = "undefined" == typeof console ? b : function(a) {
                console.error(a)
            }
            ;
            return a.bridget = function(a, b) {
                c(b),
                e(a, b)
            }
            ,
            a.bridget
        }
    }
    var d = Array.prototype.slice;
    "function" == typeof define && define.amd ? define("jquery-bridget/jquery.bridget", ["jquery"], c) : c("object" == typeof exports ? require("jquery") : a.jQuery)
}(window),
function(a) {
    function b(b) {
        var c = a.event;
        return c.target = c.target || c.srcElement || b,
        c
    }
    var c = document.documentElement
      , d = function() {};
    c.addEventListener ? d = function(a, b, c) {
        a.addEventListener(b, c, !1)
    }
    : c.attachEvent && (d = function(a, c, d) {
        a[c + d] = d.handleEvent ? function() {
            var c = b(a);
            d.handleEvent.call(d, c)
        }
        : function() {
            var c = b(a);
            d.call(a, c)
        }
        ,
        a.attachEvent("on" + c, a[c + d])
    }
    );
    var e = function() {};
    c.removeEventListener ? e = function(a, b, c) {
        a.removeEventListener(b, c, !1)
    }
    : c.detachEvent && (e = function(a, b, c) {
        a.detachEvent("on" + b, a[b + c]);
        try {
            delete a[b + c]
        } catch (d) {
            a[b + c] = void 0
        }
    }
    );
    var f = {
        bind: d,
        unbind: e
    };
    "function" == typeof define && define.amd ? define("eventie/eventie", f) : "object" == typeof exports ? module.exports = f : a.eventie = f
}(window),
function() {
    "use strict";
    function a() {}
    function b(a, b) {
        for (var c = a.length; c--; )
            if (a[c].listener === b)
                return c;
        return -1
    }
    function c(a) {
        return function() {
            return this[a].apply(this, arguments)
        }
    }
    var d = a.prototype
      , e = this
      , f = e.EventEmitter;
    d.getListeners = function(a) {
        var b, c, d = this._getEvents();
        if (a instanceof RegExp) {
            b = {};
            for (c in d)
                d.hasOwnProperty(c) && a.test(c) && (b[c] = d[c])
        } else
            b = d[a] || (d[a] = []);
        return b
    }
    ,
    d.flattenListeners = function(a) {
        var b, c = [];
        for (b = 0; b < a.length; b += 1)
            c.push(a[b].listener);
        return c
    }
    ,
    d.getListenersAsObject = function(a) {
        var b, c = this.getListeners(a);
        return c instanceof Array && (b = {},
        b[a] = c),
        b || c
    }
    ,
    d.addListener = function(a, c) {
        var d, e = this.getListenersAsObject(a), f = "object" == typeof c;
        for (d in e)
            e.hasOwnProperty(d) && -1 === b(e[d], c) && e[d].push(f ? c : {
                listener: c,
                once: !1
            });
        return this
    }
    ,
    d.on = c("addListener"),
    d.addOnceListener = function(a, b) {
        return this.addListener(a, {
            listener: b,
            once: !0
        })
    }
    ,
    d.once = c("addOnceListener"),
    d.defineEvent = function(a) {
        return this.getListeners(a),
        this
    }
    ,
    d.defineEvents = function(a) {
        for (var b = 0; b < a.length; b += 1)
            this.defineEvent(a[b]);
        return this
    }
    ,
    d.removeListener = function(a, c) {
        var d, e, f = this.getListenersAsObject(a);
        for (e in f)
            f.hasOwnProperty(e) && (d = b(f[e], c),
            -1 !== d && f[e].splice(d, 1));
        return this
    }
    ,
    d.off = c("removeListener"),
    d.addListeners = function(a, b) {
        return this.manipulateListeners(!1, a, b)
    }
    ,
    d.removeListeners = function(a, b) {
        return this.manipulateListeners(!0, a, b)
    }
    ,
    d.manipulateListeners = function(a, b, c) {
        var d, e, f = a ? this.removeListener : this.addListener, g = a ? this.removeListeners : this.addListeners;
        if ("object" != typeof b || b instanceof RegExp)
            for (d = c.length; d--; )
                f.call(this, b, c[d]);
        else
            for (d in b)
                b.hasOwnProperty(d) && (e = b[d]) && ("function" == typeof e ? f.call(this, d, e) : g.call(this, d, e));
        return this
    }
    ,
    d.removeEvent = function(a) {
        var b, c = typeof a, d = this._getEvents();
        if ("string" === c)
            delete d[a];
        else if (a instanceof RegExp)
            for (b in d)
                d.hasOwnProperty(b) && a.test(b) && delete d[b];
        else
            delete this._events;
        return this
    }
    ,
    d.removeAllListeners = c("removeEvent"),
    d.emitEvent = function(a, b) {
        var c, d, e, f, g = this.getListenersAsObject(a);
        for (e in g)
            if (g.hasOwnProperty(e))
                for (d = g[e].length; d--; )
                    c = g[e][d],
                    c.once === !0 && this.removeListener(a, c.listener),
                    f = c.listener.apply(this, b || []),
                    f === this._getOnceReturnValue() && this.removeListener(a, c.listener);
        return this
    }
    ,
    d.trigger = c("emitEvent"),
    d.emit = function(a) {
        var b = Array.prototype.slice.call(arguments, 1);
        return this.emitEvent(a, b)
    }
    ,
    d.setOnceReturnValue = function(a) {
        return this._onceReturnValue = a,
        this
    }
    ,
    d._getOnceReturnValue = function() {
        return this.hasOwnProperty("_onceReturnValue") ? this._onceReturnValue : !0
    }
    ,
    d._getEvents = function() {
        return this._events || (this._events = {})
    }
    ,
    a.noConflict = function() {
        return e.EventEmitter = f,
        a
    }
    ,
    "function" == typeof define && define.amd ? define("eventEmitter/EventEmitter", [], function() {
        return a
    }) : "object" == typeof module && module.exports ? module.exports = a : e.EventEmitter = a
}
.call(this),
function(a) {
    function b(a) {
        if (a) {
            if ("string" == typeof d[a])
                return a;
            a = a.charAt(0).toUpperCase() + a.slice(1);
            for (var b, e = 0, f = c.length; f > e; e++)
                if (b = c[e] + a,
                "string" == typeof d[b])
                    return b
        }
    }
    var c = "Webkit Moz ms Ms O".split(" ")
      , d = document.documentElement.style;
    "function" == typeof define && define.amd ? define("get-style-property/get-style-property", [], function() {
        return b
    }) : "object" == typeof exports ? module.exports = b : a.getStyleProperty = b
}(window),
function(a, b) {
    function c(a) {
        var b = parseFloat(a)
          , c = -1 === a.indexOf("%") && !isNaN(b);
        return c && b
    }
    function d() {}
    function e() {
        for (var a = {
            width: 0,
            height: 0,
            innerWidth: 0,
            innerHeight: 0,
            outerWidth: 0,
            outerHeight: 0
        }, b = 0, c = h.length; c > b; b++) {
            var d = h[b];
            a[d] = 0
        }
        return a
    }
    function f(b) {
        function d() {
            if (!m) {
                m = !0;
                var d = a.getComputedStyle;
                if (j = function() {
                    var a = d ? function(a) {
                        return d(a, null)
                    }
                    : function(a) {
                        return a.currentStyle
                    }
                    ;
                    return function(b) {
                        var c = a(b);
                        return c || g("Style returned " + c + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"),
                        c
                    }
                }(),
                k = b("boxSizing")) {
                    var e = document.createElement("div");
                    e.style.width = "200px",
                    e.style.padding = "1px 2px 3px 4px",
                    e.style.borderStyle = "solid",
                    e.style.borderWidth = "1px 2px 3px 4px",
                    e.style[k] = "border-box";
                    var f = document.body || document.documentElement;
                    f.appendChild(e);
                    var h = j(e);
                    l = 200 === c(h.width),
                    f.removeChild(e)
                }
            }
        }
        function f(a) {
            if (d(),
            "string" == typeof a && (a = document.querySelector(a)),
            a && "object" == typeof a && a.nodeType) {
                var b = j(a);
                if ("none" === b.display)
                    return e();
                var f = {};
                f.width = a.offsetWidth,
                f.height = a.offsetHeight;
                for (var g = f.isBorderBox = !(!k || !b[k] || "border-box" !== b[k]), m = 0, n = h.length; n > m; m++) {
                    var o = h[m]
                      , p = b[o];
                    p = i(a, p);
                    var q = parseFloat(p);
                    f[o] = isNaN(q) ? 0 : q
                }
                var r = f.paddingLeft + f.paddingRight
                  , s = f.paddingTop + f.paddingBottom
                  , t = f.marginLeft + f.marginRight
                  , u = f.marginTop + f.marginBottom
                  , v = f.borderLeftWidth + f.borderRightWidth
                  , w = f.borderTopWidth + f.borderBottomWidth
                  , x = g && l
                  , y = c(b.width);
                y !== !1 && (f.width = y + (x ? 0 : r + v));
                var z = c(b.height);
                return z !== !1 && (f.height = z + (x ? 0 : s + w)),
                f.innerWidth = f.width - (r + v),
                f.innerHeight = f.height - (s + w),
                f.outerWidth = f.width + t,
                f.outerHeight = f.height + u,
                f
            }
        }
        function i(b, c) {
            if (a.getComputedStyle || -1 === c.indexOf("%"))
                return c;
            var d = b.style
              , e = d.left
              , f = b.runtimeStyle
              , g = f && f.left;
            return g && (f.left = b.currentStyle.left),
            d.left = c,
            c = d.pixelLeft,
            d.left = e,
            g && (f.left = g),
            c
        }
        var j, k, l, m = !1;
        return f
    }
    var g = "undefined" == typeof console ? d : function(a) {
        console.error(a)
    }
      , h = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"];
    "function" == typeof define && define.amd ? define("get-size/get-size", ["get-style-property/get-style-property"], f) : "object" == typeof exports ? module.exports = f(require("desandro-get-style-property")) : a.getSize = f(a.getStyleProperty)
}(window),
function(a) {
    function b(a) {
        "function" == typeof a && (b.isReady ? a() : g.push(a))
    }
    function c(a) {
        var c = "readystatechange" === a.type && "complete" !== f.readyState;
        b.isReady || c || d()
    }
    function d() {
        b.isReady = !0;
        for (var a = 0, c = g.length; c > a; a++) {
            var d = g[a];
            d()
        }
    }
    function e(e) {
        return "complete" === f.readyState ? d() : (e.bind(f, "DOMContentLoaded", c),
        e.bind(f, "readystatechange", c),
        e.bind(a, "load", c)),
        b
    }
    var f = a.document
      , g = [];
    b.isReady = !1,
    "function" == typeof define && define.amd ? define("doc-ready/doc-ready", ["eventie/eventie"], e) : "object" == typeof exports ? module.exports = e(require("eventie")) : a.docReady = e(a.eventie)
}(window),
function(a) {
    "use strict";
    function b(a, b) {
        return a[g](b)
    }
    function c(a) {
        if (!a.parentNode) {
            var b = document.createDocumentFragment();
            b.appendChild(a)
        }
    }
    function d(a, b) {
        c(a);
        for (var d = a.parentNode.querySelectorAll(b), e = 0, f = d.length; f > e; e++)
            if (d[e] === a)
                return !0;
        return !1
    }
    function e(a, d) {
        return c(a),
        b(a, d)
    }
    var f, g = function() {
        if (a.matches)
            return "matches";
        if (a.matchesSelector)
            return "matchesSelector";
        for (var b = ["webkit", "moz", "ms", "o"], c = 0, d = b.length; d > c; c++) {
            var e = b[c]
              , f = e + "MatchesSelector";
            if (a[f])
                return f
        }
    }();
    if (g) {
        var h = document.createElement("div")
          , i = b(h, "div");
        f = i ? b : e
    } else
        f = d;
    "function" == typeof define && define.amd ? define("matches-selector/matches-selector", [], function() {
        return f
    }) : "object" == typeof exports ? module.exports = f : window.matchesSelector = f
}(Element.prototype),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["doc-ready/doc-ready", "matches-selector/matches-selector"], function(c, d) {
        return b(a, c, d)
    }) : "object" == typeof exports ? module.exports = b(a, require("doc-ready"), require("desandro-matches-selector")) : a.fizzyUIUtils = b(a, a.docReady, a.matchesSelector)
}(window, function(a, b, c) {
    var d = {};
    d.extend = function(a, b) {
        for (var c in b)
            a[c] = b[c];
        return a
    }
    ,
    d.modulo = function(a, b) {
        return (a % b + b) % b
    }
    ;
    var e = Object.prototype.toString;
    d.isArray = function(a) {
        return "[object Array]" == e.call(a)
    }
    ,
    d.makeArray = function(a) {
        var b = [];
        if (d.isArray(a))
            b = a;
        else if (a && "number" == typeof a.length)
            for (var c = 0, e = a.length; e > c; c++)
                b.push(a[c]);
        else
            b.push(a);
        return b
    }
    ,
    d.indexOf = Array.prototype.indexOf ? function(a, b) {
        return a.indexOf(b)
    }
    : function(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b)
                return c;
        return -1
    }
    ,
    d.removeFrom = function(a, b) {
        var c = d.indexOf(a, b);
        -1 != c && a.splice(c, 1)
    }
    ,
    d.isElement = "function" == typeof HTMLElement || "object" == typeof HTMLElement ? function(a) {
        return a instanceof HTMLElement
    }
    : function(a) {
        return a && "object" == typeof a && 1 == a.nodeType && "string" == typeof a.nodeName
    }
    ,
    d.setText = function() {
        function a(a, c) {
            b = b || (void 0 !== document.documentElement.textContent ? "textContent" : "innerText"),
            a[b] = c
        }
        var b;
        return a
    }(),
    d.getParent = function(a, b) {
        for (; a != document.body; )
            if (a = a.parentNode,
            c(a, b))
                return a
    }
    ,
    d.getQueryElement = function(a) {
        return "string" == typeof a ? document.querySelector(a) : a
    }
    ,
    d.handleEvent = function(a) {
        var b = "on" + a.type;
        this[b] && this[b](a)
    }
    ,
    d.filterFindElements = function(a, b) {
        a = d.makeArray(a);
        for (var e = [], f = 0, g = a.length; g > f; f++) {
            var h = a[f];
            if (d.isElement(h))
                if (b) {
                    c(h, b) && e.push(h);
                    for (var i = h.querySelectorAll(b), j = 0, k = i.length; k > j; j++)
                        e.push(i[j])
                } else
                    e.push(h)
        }
        return e
    }
    ,
    d.debounceMethod = function(a, b, c) {
        var d = a.prototype[b]
          , e = b + "Timeout";
        a.prototype[b] = function() {
            var a = this[e];
            a && clearTimeout(a);
            var b = arguments
              , f = this;
            this[e] = setTimeout(function() {
                d.apply(f, b),
                delete f[e]
            }, c || 100)
        }
    }
    ,
    d.toDashed = function(a) {
        return a.replace(/(.)([A-Z])/g, function(a, b, c) {
            return b + "-" + c
        }).toLowerCase()
    }
    ;
    var f = a.console;
    return d.htmlInit = function(c, e) {
        b(function() {
            for (var b = d.toDashed(e), g = document.querySelectorAll(".js-" + b), h = "data-" + b + "-options", i = 0, j = g.length; j > i; i++) {
                var k, l = g[i], m = l.getAttribute(h);
                try {
                    k = m && JSON.parse(m)
                } catch (n) {
                    f && f.error("Error parsing " + h + " on " + l.nodeName.toLowerCase() + (l.id ? "#" + l.id : "") + ": " + n);
                    continue
                }
                var o = new c(l,k)
                  , p = a.jQuery;
                p && p.data(l, e, o)
            }
        })
    }
    ,
    d
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("outlayer/item", ["eventEmitter/EventEmitter", "get-size/get-size", "get-style-property/get-style-property", "fizzy-ui-utils/utils"], function(c, d, e, f) {
        return b(a, c, d, e, f)
    }) : "object" == typeof exports ? module.exports = b(a, require("wolfy87-eventemitter"), require("get-size"), require("desandro-get-style-property"), require("fizzy-ui-utils")) : (a.Outlayer = {},
    a.Outlayer.Item = b(a, a.EventEmitter, a.getSize, a.getStyleProperty, a.fizzyUIUtils))
}(window, function(a, b, c, d, e) {
    "use strict";
    function f(a) {
        for (var b in a)
            return !1;
        return b = null,
        !0
    }
    function g(a, b) {
        a && (this.element = a,
        this.layout = b,
        this.position = {
            x: 0,
            y: 0
        },
        this._create())
    }
    function h(a) {
        return a.replace(/([A-Z])/g, function(a) {
            return "-" + a.toLowerCase()
        })
    }
    var i = a.getComputedStyle
      , j = i ? function(a) {
        return i(a, null)
    }
    : function(a) {
        return a.currentStyle
    }
      , k = d("transition")
      , l = d("transform")
      , m = k && l
      , n = !!d("perspective")
      , o = {
        WebkitTransition: "webkitTransitionEnd",
        MozTransition: "transitionend",
        OTransition: "otransitionend",
        transition: "transitionend"
    }[k]
      , p = ["transform", "transition", "transitionDuration", "transitionProperty"]
      , q = function() {
        for (var a = {}, b = 0, c = p.length; c > b; b++) {
            var e = p[b]
              , f = d(e);
            f && f !== e && (a[e] = f)
        }
        return a
    }();
    e.extend(g.prototype, b.prototype),
    g.prototype._create = function() {
        this._transn = {
            ingProperties: {},
            clean: {},
            onEnd: {}
        },
        this.css({
            position: "absolute"
        })
    }
    ,
    g.prototype.handleEvent = function(a) {
        var b = "on" + a.type;
        this[b] && this[b](a)
    }
    ,
    g.prototype.getSize = function() {
        this.size = c(this.element)
    }
    ,
    g.prototype.css = function(a) {
        var b = this.element.style;
        for (var c in a) {
            var d = q[c] || c;
            b[d] = a[c]
        }
    }
    ,
    g.prototype.getPosition = function() {
        var a = j(this.element)
          , b = this.layout.options
          , c = b.isOriginLeft
          , d = b.isOriginTop
          , e = a[c ? "left" : "right"]
          , f = a[d ? "top" : "bottom"]
          , g = this.layout.size
          , h = -1 != e.indexOf("%") ? parseFloat(e) / 100 * g.width : parseInt(e, 10)
          , i = -1 != f.indexOf("%") ? parseFloat(f) / 100 * g.height : parseInt(f, 10);
        h = isNaN(h) ? 0 : h,
        i = isNaN(i) ? 0 : i,
        h -= c ? g.paddingLeft : g.paddingRight,
        i -= d ? g.paddingTop : g.paddingBottom,
        this.position.x = h,
        this.position.y = i
    }
    ,
    g.prototype.layoutPosition = function() {
        var a = this.layout.size
          , b = this.layout.options
          , c = {}
          , d = b.isOriginLeft ? "paddingLeft" : "paddingRight"
          , e = b.isOriginLeft ? "left" : "right"
          , f = b.isOriginLeft ? "right" : "left"
          , g = this.position.x + a[d];
        c[e] = this.getXValue(g),
        c[f] = "";
        var h = b.isOriginTop ? "paddingTop" : "paddingBottom"
          , i = b.isOriginTop ? "top" : "bottom"
          , j = b.isOriginTop ? "bottom" : "top"
          , k = this.position.y + a[h];
        c[i] = this.getYValue(k),
        c[j] = "",
        this.css(c),
        this.emitEvent("layout", [this])
    }
    ,
    g.prototype.getXValue = function(a) {
        var b = this.layout.options;
        return b.percentPosition && !b.isHorizontal ? a / this.layout.size.width * 100 + "%" : a + "px"
    }
    ,
    g.prototype.getYValue = function(a) {
        var b = this.layout.options;
        return b.percentPosition && b.isHorizontal ? a / this.layout.size.height * 100 + "%" : a + "px"
    }
    ,
    g.prototype._transitionTo = function(a, b) {
        this.getPosition();
        var c = this.position.x
          , d = this.position.y
          , e = parseInt(a, 10)
          , f = parseInt(b, 10)
          , g = e === this.position.x && f === this.position.y;
        if (this.setPosition(a, b),
        g && !this.isTransitioning)
            return void this.layoutPosition();
        var h = a - c
          , i = b - d
          , j = {};
        j.transform = this.getTranslate(h, i),
        this.transition({
            to: j,
            onTransitionEnd: {
                transform: this.layoutPosition
            },
            isCleaning: !0
        })
    }
    ,
    g.prototype.getTranslate = function(a, b) {
        var c = this.layout.options;
        return a = c.isOriginLeft ? a : -a,
        b = c.isOriginTop ? b : -b,
        n ? "translate3d(" + a + "px, " + b + "px, 0)" : "translate(" + a + "px, " + b + "px)"
    }
    ,
    g.prototype.goTo = function(a, b) {
        this.setPosition(a, b),
        this.layoutPosition()
    }
    ,
    g.prototype.moveTo = m ? g.prototype._transitionTo : g.prototype.goTo,
    g.prototype.setPosition = function(a, b) {
        this.position.x = parseInt(a, 10),
        this.position.y = parseInt(b, 10)
    }
    ,
    g.prototype._nonTransition = function(a) {
        this.css(a.to),
        a.isCleaning && this._removeStyles(a.to);
        for (var b in a.onTransitionEnd)
            a.onTransitionEnd[b].call(this)
    }
    ,
    g.prototype._transition = function(a) {
        if (!parseFloat(this.layout.options.transitionDuration))
            return void this._nonTransition(a);
        var b = this._transn;
        for (var c in a.onTransitionEnd)
            b.onEnd[c] = a.onTransitionEnd[c];
        for (c in a.to)
            b.ingProperties[c] = !0,
            a.isCleaning && (b.clean[c] = !0);
        if (a.from) {
            this.css(a.from);
            var d = this.element.offsetHeight;
            d = null
        }
        this.enableTransition(a.to),
        this.css(a.to),
        this.isTransitioning = !0
    }
    ;
    var r = "opacity," + h(q.transform || "transform");
    g.prototype.enableTransition = function() {
        this.isTransitioning || (this.css({
            transitionProperty: r,
            transitionDuration: this.layout.options.transitionDuration
        }),
        this.element.addEventListener(o, this, !1))
    }
    ,
    g.prototype.transition = g.prototype[k ? "_transition" : "_nonTransition"],
    g.prototype.onwebkitTransitionEnd = function(a) {
        this.ontransitionend(a)
    }
    ,
    g.prototype.onotransitionend = function(a) {
        this.ontransitionend(a)
    }
    ;
    var s = {
        "-webkit-transform": "transform",
        "-moz-transform": "transform",
        "-o-transform": "transform"
    };
    g.prototype.ontransitionend = function(a) {
        if (a.target === this.element) {
            var b = this._transn
              , c = s[a.propertyName] || a.propertyName;
            if (delete b.ingProperties[c],
            f(b.ingProperties) && this.disableTransition(),
            c in b.clean && (this.element.style[a.propertyName] = "",
            delete b.clean[c]),
            c in b.onEnd) {
                var d = b.onEnd[c];
                d.call(this),
                delete b.onEnd[c]
            }
            this.emitEvent("transitionEnd", [this])
        }
    }
    ,
    g.prototype.disableTransition = function() {
        this.removeTransitionStyles(),
        this.element.removeEventListener(o, this, !1),
        this.isTransitioning = !1
    }
    ,
    g.prototype._removeStyles = function(a) {
        var b = {};
        for (var c in a)
            b[c] = "";
        this.css(b)
    }
    ;
    var t = {
        transitionProperty: "",
        transitionDuration: ""
    };
    return g.prototype.removeTransitionStyles = function() {
        this.css(t)
    }
    ,
    g.prototype.removeElem = function() {
        this.element.parentNode.removeChild(this.element),
        this.css({
            display: ""
        }),
        this.emitEvent("remove", [this])
    }
    ,
    g.prototype.remove = function() {
        if (!k || !parseFloat(this.layout.options.transitionDuration))
            return void this.removeElem();
        var a = this;
        this.once("transitionEnd", function() {
            a.removeElem()
        }),
        this.hide()
    }
    ,
    g.prototype.reveal = function() {
        delete this.isHidden,
        this.css({
            display: ""
        });
        var a = this.layout.options
          , b = {}
          , c = this.getHideRevealTransitionEndProperty("visibleStyle");
        b[c] = this.onRevealTransitionEnd,
        this.transition({
            from: a.hiddenStyle,
            to: a.visibleStyle,
            isCleaning: !0,
            onTransitionEnd: b
        })
    }
    ,
    g.prototype.onRevealTransitionEnd = function() {
        this.isHidden || this.emitEvent("reveal")
    }
    ,
    g.prototype.getHideRevealTransitionEndProperty = function(a) {
        var b = this.layout.options[a];
        if (b.opacity)
            return "opacity";
        for (var c in b)
            return c
    }
    ,
    g.prototype.hide = function() {
        this.isHidden = !0,
        this.css({
            display: ""
        });
        var a = this.layout.options
          , b = {}
          , c = this.getHideRevealTransitionEndProperty("hiddenStyle");
        b[c] = this.onHideTransitionEnd,
        this.transition({
            from: a.visibleStyle,
            to: a.hiddenStyle,
            isCleaning: !0,
            onTransitionEnd: b
        })
    }
    ,
    g.prototype.onHideTransitionEnd = function() {
        this.isHidden && (this.css({
            display: "none"
        }),
        this.emitEvent("hide"))
    }
    ,
    g.prototype.destroy = function() {
        this.css({
            position: "",
            left: "",
            right: "",
            top: "",
            bottom: "",
            transition: "",
            transform: ""
        })
    }
    ,
    g
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("outlayer/outlayer", ["eventie/eventie", "eventEmitter/EventEmitter", "get-size/get-size", "fizzy-ui-utils/utils", "./item"], function(c, d, e, f, g) {
        return b(a, c, d, e, f, g)
    }) : "object" == typeof exports ? module.exports = b(a, require("eventie"), require("wolfy87-eventemitter"), require("get-size"), require("fizzy-ui-utils"), require("./item")) : a.Outlayer = b(a, a.eventie, a.EventEmitter, a.getSize, a.fizzyUIUtils, a.Outlayer.Item)
}(window, function(a, b, c, d, e, f) {
    "use strict";
    function g(a, b) {
        var c = e.getQueryElement(a);
        if (!c)
            return void (h && h.error("Bad element for " + this.constructor.namespace + ": " + (c || a)));
        this.element = c,
        i && (this.$element = i(this.element)),
        this.options = e.extend({}, this.constructor.defaults),
        this.option(b);
        var d = ++k;
        this.element.outlayerGUID = d,
        l[d] = this,
        this._create(),
        this.options.isInitLayout && this.layout()
    }
    var h = a.console
      , i = a.jQuery
      , j = function() {}
      , k = 0
      , l = {};
    return g.namespace = "outlayer",
    g.Item = f,
    g.defaults = {
        containerStyle: {
            position: "relative"
        },
        isInitLayout: !0,
        isOriginLeft: !0,
        isOriginTop: !0,
        isResizeBound: !0,
        isResizingContainer: !0,
        transitionDuration: "0.4s",
        hiddenStyle: {
            opacity: 0,
            transform: "scale(0.001)"
        },
        visibleStyle: {
            opacity: 1,
            transform: "scale(1)"
        }
    },
    e.extend(g.prototype, c.prototype),
    g.prototype.option = function(a) {
        e.extend(this.options, a)
    }
    ,
    g.prototype._create = function() {
        this.reloadItems(),
        this.stamps = [],
        this.stamp(this.options.stamp),
        e.extend(this.element.style, this.options.containerStyle),
        this.options.isResizeBound && this.bindResize()
    }
    ,
    g.prototype.reloadItems = function() {
        this.items = this._itemize(this.element.children)
    }
    ,
    g.prototype._itemize = function(a) {
        for (var b = this._filterFindItemElements(a), c = this.constructor.Item, d = [], e = 0, f = b.length; f > e; e++) {
            var g = b[e]
              , h = new c(g,this);
            d.push(h)
        }
        return d
    }
    ,
    g.prototype._filterFindItemElements = function(a) {
        return e.filterFindElements(a, this.options.itemSelector)
    }
    ,
    g.prototype.getItemElements = function() {
        for (var a = [], b = 0, c = this.items.length; c > b; b++)
            a.push(this.items[b].element);
        return a
    }
    ,
    g.prototype.layout = function() {
        this._resetLayout(),
        this._manageStamps();
        var a = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
        this.layoutItems(this.items, a),
        this._isLayoutInited = !0
    }
    ,
    g.prototype._init = g.prototype.layout,
    g.prototype._resetLayout = function() {
        this.getSize()
    }
    ,
    g.prototype.getSize = function() {
        this.size = d(this.element)
    }
    ,
    g.prototype._getMeasurement = function(a, b) {
        var c, f = this.options[a];
        f ? ("string" == typeof f ? c = this.element.querySelector(f) : e.isElement(f) && (c = f),
        this[a] = c ? d(c)[b] : f) : this[a] = 0
    }
    ,
    g.prototype.layoutItems = function(a, b) {
        a = this._getItemsForLayout(a),
        this._layoutItems(a, b),
        this._postLayout()
    }
    ,
    g.prototype._getItemsForLayout = function(a) {
        for (var b = [], c = 0, d = a.length; d > c; c++) {
            var e = a[c];
            e.isIgnored || b.push(e)
        }
        return b
    }
    ,
    g.prototype._layoutItems = function(a, b) {
        if (this._emitCompleteOnItems("layout", a),
        a && a.length) {
            for (var c = [], d = 0, e = a.length; e > d; d++) {
                var f = a[d]
                  , g = this._getItemLayoutPosition(f);
                g.item = f,
                g.isInstant = b || f.isLayoutInstant,
                c.push(g)
            }
            this._processLayoutQueue(c)
        }
    }
    ,
    g.prototype._getItemLayoutPosition = function() {
        return {
            x: 0,
            y: 0
        }
    }
    ,
    g.prototype._processLayoutQueue = function(a) {
        for (var b = 0, c = a.length; c > b; b++) {
            var d = a[b];
            this._positionItem(d.item, d.x, d.y, d.isInstant)
        }
    }
    ,
    g.prototype._positionItem = function(a, b, c, d) {
        d ? a.goTo(b, c) : a.moveTo(b, c)
    }
    ,
    g.prototype._postLayout = function() {
        this.resizeContainer()
    }
    ,
    g.prototype.resizeContainer = function() {
        if (this.options.isResizingContainer) {
            var a = this._getContainerSize();
            a && (this._setContainerMeasure(a.width, !0),
            this._setContainerMeasure(a.height, !1))
        }
    }
    ,
    g.prototype._getContainerSize = j,
    g.prototype._setContainerMeasure = function(a, b) {
        if (void 0 !== a) {
            var c = this.size;
            c.isBorderBox && (a += b ? c.paddingLeft + c.paddingRight + c.borderLeftWidth + c.borderRightWidth : c.paddingBottom + c.paddingTop + c.borderTopWidth + c.borderBottomWidth),
            a = Math.max(a, 0),
            this.element.style[b ? "width" : "height"] = a + "px"
        }
    }
    ,
    g.prototype._emitCompleteOnItems = function(a, b) {
        function c() {
            e.dispatchEvent(a + "Complete", null, [b])
        }
        function d() {
            g++,
            g === f && c()
        }
        var e = this
          , f = b.length;
        if (!b || !f)
            return void c();
        for (var g = 0, h = 0, i = b.length; i > h; h++) {
            var j = b[h];
            j.once(a, d)
        }
    }
    ,
    g.prototype.dispatchEvent = function(a, b, c) {
        var d = b ? [b].concat(c) : c;
        if (this.emitEvent(a, d),
        i)
            if (this.$element = this.$element || i(this.element),
            b) {
                var e = i.Event(b);
                e.type = a,
                this.$element.trigger(e, c)
            } else
                this.$element.trigger(a, c)
    }
    ,
    g.prototype.ignore = function(a) {
        var b = this.getItem(a);
        b && (b.isIgnored = !0)
    }
    ,
    g.prototype.unignore = function(a) {
        var b = this.getItem(a);
        b && delete b.isIgnored
    }
    ,
    g.prototype.stamp = function(a) {
        if (a = this._find(a)) {
            this.stamps = this.stamps.concat(a);
            for (var b = 0, c = a.length; c > b; b++) {
                var d = a[b];
                this.ignore(d)
            }
        }
    }
    ,
    g.prototype.unstamp = function(a) {
        if (a = this._find(a))
            for (var b = 0, c = a.length; c > b; b++) {
                var d = a[b];
                e.removeFrom(this.stamps, d),
                this.unignore(d)
            }
    }
    ,
    g.prototype._find = function(a) {
        return a ? ("string" == typeof a && (a = this.element.querySelectorAll(a)),
        a = e.makeArray(a)) : void 0
    }
    ,
    g.prototype._manageStamps = function() {
        if (this.stamps && this.stamps.length) {
            this._getBoundingRect();
            for (var a = 0, b = this.stamps.length; b > a; a++) {
                var c = this.stamps[a];
                this._manageStamp(c)
            }
        }
    }
    ,
    g.prototype._getBoundingRect = function() {
        var a = this.element.getBoundingClientRect()
          , b = this.size;
        this._boundingRect = {
            left: a.left + b.paddingLeft + b.borderLeftWidth,
            top: a.top + b.paddingTop + b.borderTopWidth,
            right: a.right - (b.paddingRight + b.borderRightWidth),
            bottom: a.bottom - (b.paddingBottom + b.borderBottomWidth)
        }
    }
    ,
    g.prototype._manageStamp = j,
    g.prototype._getElementOffset = function(a) {
        var b = a.getBoundingClientRect()
          , c = this._boundingRect
          , e = d(a)
          , f = {
            left: b.left - c.left - e.marginLeft,
            top: b.top - c.top - e.marginTop,
            right: c.right - b.right - e.marginRight,
            bottom: c.bottom - b.bottom - e.marginBottom
        };
        return f
    }
    ,
    g.prototype.handleEvent = function(a) {
        var b = "on" + a.type;
        this[b] && this[b](a)
    }
    ,
    g.prototype.bindResize = function() {
        this.isResizeBound || (b.bind(a, "resize", this),
        this.isResizeBound = !0)
    }
    ,
    g.prototype.unbindResize = function() {
        this.isResizeBound && b.unbind(a, "resize", this),
        this.isResizeBound = !1
    }
    ,
    g.prototype.onresize = function() {
        function a() {
            b.resize(),
            delete b.resizeTimeout
        }
        this.resizeTimeout && clearTimeout(this.resizeTimeout);
        var b = this;
        this.resizeTimeout = setTimeout(a, 100)
    }
    ,
    g.prototype.resize = function() {
        this.isResizeBound && this.needsResizeLayout() && this.layout()
    }
    ,
    g.prototype.needsResizeLayout = function() {
        var a = d(this.element)
          , b = this.size && a;
        return b && a.innerWidth !== this.size.innerWidth
    }
    ,
    g.prototype.addItems = function(a) {
        var b = this._itemize(a);
        return b.length && (this.items = this.items.concat(b)),
        b
    }
    ,
    g.prototype.appended = function(a) {
        var b = this.addItems(a);
        b.length && (this.layoutItems(b, !0),
        this.reveal(b))
    }
    ,
    g.prototype.prepended = function(a) {
        var b = this._itemize(a);
        if (b.length) {
            var c = this.items.slice(0);
            this.items = b.concat(c),
            this._resetLayout(),
            this._manageStamps(),
            this.layoutItems(b, !0),
            this.reveal(b),
            this.layoutItems(c)
        }
    }
    ,
    g.prototype.reveal = function(a) {
        this._emitCompleteOnItems("reveal", a);
        for (var b = a && a.length, c = 0; b && b > c; c++) {
            var d = a[c];
            d.reveal()
        }
    }
    ,
    g.prototype.hide = function(a) {
        this._emitCompleteOnItems("hide", a);
        for (var b = a && a.length, c = 0; b && b > c; c++) {
            var d = a[c];
            d.hide()
        }
    }
    ,
    g.prototype.revealItemElements = function(a) {
        var b = this.getItems(a);
        this.reveal(b)
    }
    ,
    g.prototype.hideItemElements = function(a) {
        var b = this.getItems(a);
        this.hide(b)
    }
    ,
    g.prototype.getItem = function(a) {
        for (var b = 0, c = this.items.length; c > b; b++) {
            var d = this.items[b];
            if (d.element === a)
                return d
        }
    }
    ,
    g.prototype.getItems = function(a) {
        a = e.makeArray(a);
        for (var b = [], c = 0, d = a.length; d > c; c++) {
            var f = a[c]
              , g = this.getItem(f);
            g && b.push(g)
        }
        return b
    }
    ,
    g.prototype.remove = function(a) {
        var b = this.getItems(a);
        if (this._emitCompleteOnItems("remove", b),
        b && b.length)
            for (var c = 0, d = b.length; d > c; c++) {
                var f = b[c];
                f.remove(),
                e.removeFrom(this.items, f)
            }
    }
    ,
    g.prototype.destroy = function() {
        var a = this.element.style;
        a.height = "",
        a.position = "",
        a.width = "";
        for (var b = 0, c = this.items.length; c > b; b++) {
            var d = this.items[b];
            d.destroy()
        }
        this.unbindResize();
        var e = this.element.outlayerGUID;
        delete l[e],
        delete this.element.outlayerGUID,
        i && i.removeData(this.element, this.constructor.namespace)
    }
    ,
    g.data = function(a) {
        a = e.getQueryElement(a);
        var b = a && a.outlayerGUID;
        return b && l[b]
    }
    ,
    g.create = function(a, b) {
        function c() {
            g.apply(this, arguments)
        }
        return Object.create ? c.prototype = Object.create(g.prototype) : e.extend(c.prototype, g.prototype),
        c.prototype.constructor = c,
        c.defaults = e.extend({}, g.defaults),
        e.extend(c.defaults, b),
        c.prototype.settings = {},
        c.namespace = a,
        c.data = g.data,
        c.Item = function() {
            f.apply(this, arguments)
        }
        ,
        c.Item.prototype = new f,
        e.htmlInit(c, a),
        i && i.bridget && i.bridget(a, c),
        c
    }
    ,
    g.Item = f,
    g
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("isotope/js/item", ["outlayer/outlayer"], b) : "object" == typeof exports ? module.exports = b(require("outlayer")) : (a.Isotope = a.Isotope || {},
    a.Isotope.Item = b(a.Outlayer))
}(window, function(a) {
    "use strict";
    function b() {
        a.Item.apply(this, arguments)
    }
    b.prototype = new a.Item,
    b.prototype._create = function() {
        this.id = this.layout.itemGUID++,
        a.Item.prototype._create.call(this),
        this.sortData = {}
    }
    ,
    b.prototype.updateSortData = function() {
        if (!this.isIgnored) {
            this.sortData.id = this.id,
            this.sortData["original-order"] = this.id,
            this.sortData.random = Math.random();
            var a = this.layout.options.getSortData
              , b = this.layout._sorters;
            for (var c in a) {
                var d = b[c];
                this.sortData[c] = d(this.element, this)
            }
        }
    }
    ;
    var c = b.prototype.destroy;
    return b.prototype.destroy = function() {
        c.apply(this, arguments),
        this.css({
            display: ""
        })
    }
    ,
    b
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("isotope/js/layout-mode", ["get-size/get-size", "outlayer/outlayer"], b) : "object" == typeof exports ? module.exports = b(require("get-size"), require("outlayer")) : (a.Isotope = a.Isotope || {},
    a.Isotope.LayoutMode = b(a.getSize, a.Outlayer))
}(window, function(a, b) {
    "use strict";
    function c(a) {
        this.isotope = a,
        a && (this.options = a.options[this.namespace],
        this.element = a.element,
        this.items = a.filteredItems,
        this.size = a.size)
    }
    return function() {
        function a(a) {
            return function() {
                return b.prototype[a].apply(this.isotope, arguments)
            }
        }
        for (var d = ["_resetLayout", "_getItemLayoutPosition", "_manageStamp", "_getContainerSize", "_getElementOffset", "needsResizeLayout"], e = 0, f = d.length; f > e; e++) {
            var g = d[e];
            c.prototype[g] = a(g)
        }
    }(),
    c.prototype.needsVerticalResizeLayout = function() {
        var b = a(this.isotope.element)
          , c = this.isotope.size && b;
        return c && b.innerHeight != this.isotope.size.innerHeight
    }
    ,
    c.prototype._getMeasurement = function() {
        this.isotope._getMeasurement.apply(this, arguments)
    }
    ,
    c.prototype.getColumnWidth = function() {
        this.getSegmentSize("column", "Width")
    }
    ,
    c.prototype.getRowHeight = function() {
        this.getSegmentSize("row", "Height")
    }
    ,
    c.prototype.getSegmentSize = function(a, b) {
        var c = a + b
          , d = "outer" + b;
        if (this._getMeasurement(c, d),
        !this[c]) {
            var e = this.getFirstItemSize();
            this[c] = e && e[d] || this.isotope.size["inner" + b]
        }
    }
    ,
    c.prototype.getFirstItemSize = function() {
        var b = this.isotope.filteredItems[0];
        return b && b.element && a(b.element)
    }
    ,
    c.prototype.layout = function() {
        this.isotope.layout.apply(this.isotope, arguments)
    }
    ,
    c.prototype.getSize = function() {
        this.isotope.getSize(),
        this.size = this.isotope.size
    }
    ,
    c.modes = {},
    c.create = function(a, b) {
        function d() {
            c.apply(this, arguments)
        }
        return d.prototype = new c,
        b && (d.options = b),
        d.prototype.namespace = a,
        c.modes[a] = d,
        d
    }
    ,
    c
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("masonry/masonry", ["outlayer/outlayer", "get-size/get-size", "fizzy-ui-utils/utils"], b) : "object" == typeof exports ? module.exports = b(require("outlayer"), require("get-size"), require("fizzy-ui-utils")) : a.Masonry = b(a.Outlayer, a.getSize, a.fizzyUIUtils)
}(window, function(a, b, c) {
    var d = a.create("masonry");
    return d.prototype._resetLayout = function() {
        this.getSize(),
        this._getMeasurement("columnWidth", "outerWidth"),
        this._getMeasurement("gutter", "outerWidth"),
        this.measureColumns();
        var a = this.cols;
        for (this.colYs = []; a--; )
            this.colYs.push(0);
        this.maxY = 0
    }
    ,
    d.prototype.measureColumns = function() {
        if (this.getContainerWidth(),
        !this.columnWidth) {
            var a = this.items[0]
              , c = a && a.element;
            this.columnWidth = c && b(c).outerWidth || this.containerWidth
        }
        var d = this.columnWidth += this.gutter
          , e = this.containerWidth + this.gutter
          , f = e / d
          , g = d - e % d
          , h = g && 1 > g ? "round" : "floor";
        f = Math[h](f),
        this.cols = Math.max(f, 1)
    }
    ,
    d.prototype.getContainerWidth = function() {
        var a = this.options.isFitWidth ? this.element.parentNode : this.element
          , c = b(a);
        this.containerWidth = c && c.innerWidth
    }
    ,
    d.prototype._getItemLayoutPosition = function(a) {
        a.getSize();
        var b = a.size.outerWidth % this.columnWidth
          , d = b && 1 > b ? "round" : "ceil"
          , e = Math[d](a.size.outerWidth / this.columnWidth);
        e = Math.min(e, this.cols);
        for (var f = this._getColGroup(e), g = Math.min.apply(Math, f), h = c.indexOf(f, g), i = {
            x: this.columnWidth * h,
            y: g
        }, j = g + a.size.outerHeight, k = this.cols + 1 - f.length, l = 0; k > l; l++)
            this.colYs[h + l] = j;
        return i
    }
    ,
    d.prototype._getColGroup = function(a) {
        if (2 > a)
            return this.colYs;
        for (var b = [], c = this.cols + 1 - a, d = 0; c > d; d++) {
            var e = this.colYs.slice(d, d + a);
            b[d] = Math.max.apply(Math, e)
        }
        return b
    }
    ,
    d.prototype._manageStamp = function(a) {
        var c = b(a)
          , d = this._getElementOffset(a)
          , e = this.options.isOriginLeft ? d.left : d.right
          , f = e + c.outerWidth
          , g = Math.floor(e / this.columnWidth);
        g = Math.max(0, g);
        var h = Math.floor(f / this.columnWidth);
        h -= f % this.columnWidth ? 0 : 1,
        h = Math.min(this.cols - 1, h);
        for (var i = (this.options.isOriginTop ? d.top : d.bottom) + c.outerHeight, j = g; h >= j; j++)
            this.colYs[j] = Math.max(i, this.colYs[j])
    }
    ,
    d.prototype._getContainerSize = function() {
        this.maxY = Math.max.apply(Math, this.colYs);
        var a = {
            height: this.maxY
        };
        return this.options.isFitWidth && (a.width = this._getContainerFitWidth()),
        a
    }
    ,
    d.prototype._getContainerFitWidth = function() {
        for (var a = 0, b = this.cols; --b && 0 === this.colYs[b]; )
            a++;
        return (this.cols - a) * this.columnWidth - this.gutter
    }
    ,
    d.prototype.needsResizeLayout = function() {
        var a = this.containerWidth;
        return this.getContainerWidth(),
        a !== this.containerWidth
    }
    ,
    d
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/masonry", ["../layout-mode", "masonry/masonry"], b) : "object" == typeof exports ? module.exports = b(require("../layout-mode"), require("masonry-layout")) : b(a.Isotope.LayoutMode, a.Masonry)
}(window, function(a, b) {
    "use strict";
    function c(a, b) {
        for (var c in b)
            a[c] = b[c];
        return a
    }
    var d = a.create("masonry")
      , e = d.prototype._getElementOffset
      , f = d.prototype.layout
      , g = d.prototype._getMeasurement;
    c(d.prototype, b.prototype),
    d.prototype._getElementOffset = e,
    d.prototype.layout = f,
    d.prototype._getMeasurement = g;
    var h = d.prototype.measureColumns;
    d.prototype.measureColumns = function() {
        this.items = this.isotope.filteredItems,
        h.call(this)
    }
    ;
    var i = d.prototype._manageStamp;
    return d.prototype._manageStamp = function() {
        this.options.isOriginLeft = this.isotope.options.isOriginLeft,
        this.options.isOriginTop = this.isotope.options.isOriginTop,
        i.apply(this, arguments)
    }
    ,
    d
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/fit-rows", ["../layout-mode"], b) : "object" == typeof exports ? module.exports = b(require("../layout-mode")) : b(a.Isotope.LayoutMode)
}(window, function(a) {
    "use strict";
    var b = a.create("fitRows");
    return b.prototype._resetLayout = function() {
        this.x = 0,
        this.y = 0,
        this.maxY = 0,
        this._getMeasurement("gutter", "outerWidth")
    }
    ,
    b.prototype._getItemLayoutPosition = function(a) {
        a.getSize();
        var b = a.size.outerWidth + this.gutter
          , c = this.isotope.size.innerWidth + this.gutter;
        0 !== this.x && b + this.x > c && (this.x = 0,
        this.y = this.maxY);
        var d = {
            x: this.x,
            y: this.y
        };
        return this.maxY = Math.max(this.maxY, this.y + a.size.outerHeight),
        this.x += b,
        d
    }
    ,
    b.prototype._getContainerSize = function() {
        return {
            height: this.maxY
        }
    }
    ,
    b
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define("isotope/js/layout-modes/vertical", ["../layout-mode"], b) : "object" == typeof exports ? module.exports = b(require("../layout-mode")) : b(a.Isotope.LayoutMode)
}(window, function(a) {
    "use strict";
    var b = a.create("vertical", {
        horizontalAlignment: 0
    });
    return b.prototype._resetLayout = function() {
        this.y = 0
    }
    ,
    b.prototype._getItemLayoutPosition = function(a) {
        a.getSize();
        var b = (this.isotope.size.innerWidth - a.size.outerWidth) * this.options.horizontalAlignment
          , c = this.y;
        return this.y += a.size.outerHeight,
        {
            x: b,
            y: c
        }
    }
    ,
    b.prototype._getContainerSize = function() {
        return {
            height: this.y
        }
    }
    ,
    b
}),
function(a, b) {
    "use strict";
    "function" == typeof define && define.amd ? define(["outlayer/outlayer", "get-size/get-size", "matches-selector/matches-selector", "fizzy-ui-utils/utils", "isotope/js/item", "isotope/js/layout-mode", "isotope/js/layout-modes/masonry", "isotope/js/layout-modes/fit-rows", "isotope/js/layout-modes/vertical"], function(c, d, e, f, g, h) {
        return b(a, c, d, e, f, g, h)
    }) : "object" == typeof exports ? module.exports = b(a, require("outlayer"), require("get-size"), require("desandro-matches-selector"), require("fizzy-ui-utils"), require("./item"), require("./layout-mode"), require("./layout-modes/masonry"), require("./layout-modes/fit-rows"), require("./layout-modes/vertical")) : a.Isotope = b(a, a.Outlayer, a.getSize, a.matchesSelector, a.fizzyUIUtils, a.Isotope.Item, a.Isotope.LayoutMode)
}(window, function(a, b, c, d, e, f, g) {
    function h(a, b) {
        return function(c, d) {
            for (var e = 0, f = a.length; f > e; e++) {
                var g = a[e]
                  , h = c.sortData[g]
                  , i = d.sortData[g];
                if (h > i || i > h) {
                    var j = void 0 !== b[g] ? b[g] : b
                      , k = j ? 1 : -1;
                    return (h > i ? 1 : -1) * k
                }
            }
            return 0
        }
    }
    var i = a.jQuery
      , j = String.prototype.trim ? function(a) {
        return a.trim()
    }
    : function(a) {
        return a.replace(/^\s+|\s+$/g, "")
    }
      , k = document.documentElement
      , l = k.textContent ? function(a) {
        return a.textContent
    }
    : function(a) {
        return a.innerText
    }
      , m = b.create("isotope", {
        layoutMode: "masonry",
        isJQueryFiltering: !0,
        sortAscending: !0
    });
    m.Item = f,
    m.LayoutMode = g,
    m.prototype._create = function() {
        this.itemGUID = 0,
        this._sorters = {},
        this._getSorters(),
        b.prototype._create.call(this),
        this.modes = {},
        this.filteredItems = this.items,
        this.sortHistory = ["original-order"];
        for (var a in g.modes)
            this._initLayoutMode(a)
    }
    ,
    m.prototype.reloadItems = function() {
        this.itemGUID = 0,
        b.prototype.reloadItems.call(this)
    }
    ,
    m.prototype._itemize = function() {
        for (var a = b.prototype._itemize.apply(this, arguments), c = 0, d = a.length; d > c; c++) {
            var e = a[c];
            e.id = this.itemGUID++
        }
        return this._updateItemsSortData(a),
        a
    }
    ,
    m.prototype._initLayoutMode = function(a) {
        var b = g.modes[a]
          , c = this.options[a] || {};
        this.options[a] = b.options ? e.extend(b.options, c) : c,
        this.modes[a] = new b(this)
    }
    ,
    m.prototype.layout = function() {
        return !this._isLayoutInited && this.options.isInitLayout ? void this.arrange() : void this._layout()
    }
    ,
    m.prototype._layout = function() {
        var a = this._getIsInstant();
        this._resetLayout(),
        this._manageStamps(),
        this.layoutItems(this.filteredItems, a),
        this._isLayoutInited = !0
    }
    ,
    m.prototype.arrange = function(a) {
        function b() {
            d.reveal(c.needReveal),
            d.hide(c.needHide)
        }
        this.option(a),
        this._getIsInstant();
        var c = this._filter(this.items);
        this.filteredItems = c.matches;
        var d = this;
        this._bindArrangeComplete(),
        this._isInstant ? this._noTransition(b) : b(),
        this._sort(),
        this._layout()
    }
    ,
    m.prototype._init = m.prototype.arrange,
    m.prototype._getIsInstant = function() {
        var a = void 0 !== this.options.isLayoutInstant ? this.options.isLayoutInstant : !this._isLayoutInited;
        return this._isInstant = a,
        a
    }
    ,
    m.prototype._bindArrangeComplete = function() {
        function a() {
            b && c && d && e.dispatchEvent("arrangeComplete", null, [e.filteredItems])
        }
        var b, c, d, e = this;
        this.once("layoutComplete", function() {
            b = !0,
            a()
        }),
        this.once("hideComplete", function() {
            c = !0,
            a()
        }),
        this.once("revealComplete", function() {
            d = !0,
            a()
        })
    }
    ,
    m.prototype._filter = function(a) {
        var b = this.options.filter;
        b = b || "*";
        for (var c = [], d = [], e = [], f = this._getFilterTest(b), g = 0, h = a.length; h > g; g++) {
            var i = a[g];
            if (!i.isIgnored) {
                var j = f(i);
                j && c.push(i),
                j && i.isHidden ? d.push(i) : j || i.isHidden || e.push(i)
            }
        }
        return {
            matches: c,
            needReveal: d,
            needHide: e
        }
    }
    ,
    m.prototype._getFilterTest = function(a) {
        return i && this.options.isJQueryFiltering ? function(b) {
            return i(b.element).is(a)
        }
        : "function" == typeof a ? function(b) {
            return a(b.element)
        }
        : function(b) {
            return d(b.element, a)
        }
    }
    ,
    m.prototype.updateSortData = function(a) {
        var b;
        a ? (a = e.makeArray(a),
        b = this.getItems(a)) : b = this.items,
        this._getSorters(),
        this._updateItemsSortData(b)
    }
    ,
    m.prototype._getSorters = function() {
        var a = this.options.getSortData;
        for (var b in a) {
            var c = a[b];
            this._sorters[b] = n(c)
        }
    }
    ,
    m.prototype._updateItemsSortData = function(a) {
        for (var b = a && a.length, c = 0; b && b > c; c++) {
            var d = a[c];
            d.updateSortData()
        }
    }
    ;
    var n = function() {
        function a(a) {
            if ("string" != typeof a)
                return a;
            var c = j(a).split(" ")
              , d = c[0]
              , e = d.match(/^\[(.+)\]$/)
              , f = e && e[1]
              , g = b(f, d)
              , h = m.sortDataParsers[c[1]];
            return a = h ? function(a) {
                return a && h(g(a))
            }
            : function(a) {
                return a && g(a)
            }
        }
        function b(a, b) {
            var c;
            return c = a ? function(b) {
                return b.getAttribute(a)
            }
            : function(a) {
                var c = a.querySelector(b);
                return c && l(c)
            }
        }
        return a
    }();
    m.sortDataParsers = {
        parseInt: function(a) {
            return parseInt(a, 10)
        },
        parseFloat: function(a) {
            return parseFloat(a)
        }
    },
    m.prototype._sort = function() {
        var a = this.options.sortBy;
        if (a) {
            var b = [].concat.apply(a, this.sortHistory)
              , c = h(b, this.options.sortAscending);
            this.filteredItems.sort(c),
            a != this.sortHistory[0] && this.sortHistory.unshift(a)
        }
    }
    ,
    m.prototype._mode = function() {
        var a = this.options.layoutMode
          , b = this.modes[a];
        if (!b)
            throw new Error("No layout mode: " + a);
        return b.options = this.options[a],
        b
    }
    ,
    m.prototype._resetLayout = function() {
        b.prototype._resetLayout.call(this),
        this._mode()._resetLayout()
    }
    ,
    m.prototype._getItemLayoutPosition = function(a) {
        return this._mode()._getItemLayoutPosition(a)
    }
    ,
    m.prototype._manageStamp = function(a) {
        this._mode()._manageStamp(a)
    }
    ,
    m.prototype._getContainerSize = function() {
        return this._mode()._getContainerSize()
    }
    ,
    m.prototype.needsResizeLayout = function() {
        return this._mode().needsResizeLayout()
    }
    ,
    m.prototype.appended = function(a) {
        var b = this.addItems(a);
        if (b.length) {
            var c = this._filterRevealAdded(b);
            this.filteredItems = this.filteredItems.concat(c)
        }
    }
    ,
    m.prototype.prepended = function(a) {
        var b = this._itemize(a);
        if (b.length) {
            this._resetLayout(),
            this._manageStamps();
            var c = this._filterRevealAdded(b);
            this.layoutItems(this.filteredItems),
            this.filteredItems = c.concat(this.filteredItems),
            this.items = b.concat(this.items)
        }
    }
    ,
    m.prototype._filterRevealAdded = function(a) {
        var b = this._filter(a);
        return this.hide(b.needHide),
        this.reveal(b.matches),
        this.layoutItems(b.matches, !0),
        b.matches
    }
    ,
    m.prototype.insert = function(a) {
        var b = this.addItems(a);
        if (b.length) {
            var c, d, e = b.length;
            for (c = 0; e > c; c++)
                d = b[c],
                this.element.appendChild(d.element);
            var f = this._filter(b).matches;
            for (c = 0; e > c; c++)
                b[c].isLayoutInstant = !0;
            for (this.arrange(),
            c = 0; e > c; c++)
                delete b[c].isLayoutInstant;
            this.reveal(f)
        }
    }
    ;
    var o = m.prototype.remove;
    return m.prototype.remove = function(a) {
        a = e.makeArray(a);
        var b = this.getItems(a);
        o.call(this, a);
        var c = b && b.length;
        if (c)
            for (var d = 0; c > d; d++) {
                var f = b[d];
                e.removeFrom(this.filteredItems, f)
            }
    }
    ,
    m.prototype.shuffle = function() {
        for (var a = 0, b = this.items.length; b > a; a++) {
            var c = this.items[a];
            c.sortData.random = Math.random()
        }
        this.options.sortBy = "random",
        this._sort(),
        this._layout()
    }
    ,
    m.prototype._noTransition = function(a) {
        var b = this.options.transitionDuration;
        this.options.transitionDuration = 0;
        var c = a.call(this);
        return this.options.transitionDuration = b,
        c
    }
    ,
    m.prototype.getFilteredItemElements = function() {
        for (var a = [], b = 0, c = this.filteredItems.length; c > b; b++)
            a.push(this.filteredItems[b].element);
        return a
    }
    ,
    m
});
;(function($) {
    $(function() {
        $('.gem-clients-type-carousel-grid:not(.carousel-disabled)').each(function() {
            var $clientsCarouselElement = $(this);
            var $clientsItems = $('.gem-clients-slide', $clientsCarouselElement);
            var $clientsItemsWrap = $('<div class="gem-clients-grid-carousel-wrap"/>').appendTo($clientsCarouselElement);
            var $clientsItemsCarousel = $('<div class="gem-clients-grid-carousel"/>').appendTo($clientsItemsWrap);
            var $clientsItemsPagination = $('<div class="gem-clients-grid-pagination gem-mini-pagination"/>').appendTo($clientsItemsWrap);
            $clientsItems.appendTo($clientsItemsCarousel);
        });
        $('.gem_client_carousel-items').each(function() {
            var $clientsElement = $(this);
            var $clients = $('.gem-client-item', $clientsElement);
            var $clientsWrap = $('<div class="gem-client-carousel-item-wrap"/>').appendTo($clientsElement);
            var $clientsCarousel = $('<div class="gem-client-carousel"/>').appendTo($clientsWrap);
            var $clientsNavigation = $('<div class="gem-client-carousel-navigation"/>').appendTo($clientsWrap);
            var $clientsPrev = $('<a href="#" class="gem-prev gem-client-prev"/></a>').appendTo($clientsNavigation);
            var $clientsNext = $('<a href="#" class="gem-next gem-client-next"/></a>').appendTo($clientsNavigation);
            $clients.appendTo($clientsCarousel);
        });
        $('body').updateClientsGrid();
        $('body').updateClientsCarousel();
        $('.fullwidth-block').each(function() {
            $(this).on('updateClientsCarousel', function() {
                $(this).updateClientsCarousel();
            });
        });
        $('.gem_tab').on('tab-update', function() {
            $(this).updateClientsGrid();
        });
        $(document).on('gem.show.vc.tabs', '[data-vc-accordion]', function() {
            $(this).data('vc.accordion').getTarget().updateClientsGrid();
        });
        $(document).on('gem.show.vc.accordion', '[data-vc-accordion]', function() {
            $(this).data('vc.accordion').getTarget().updateClientsGrid();
        });
    });
    $.fn.updateClientsGrid = function() {
        function initClientsGrid() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initClientsGrid.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $clientsCarouselElement = $(this);
            var $clientsItemsCarousel = $('.gem-clients-grid-carousel', $clientsCarouselElement);
            var $clientsItemsPagination = $('.gem-mini-pagination', $clientsCarouselElement);
            var autoscroll = $clientsCarouselElement.data('autoscroll') > 0 ? $clientsCarouselElement.data('autoscroll') : false;
            $clientsCarouselElement.thegemPreloader(function() {
                var $clientsGridCarousel = $clientsItemsCarousel.carouFredSel({
                    auto: autoscroll,
                    circular: false,
                    infinite: true,
                    width: '100%',
                    items: 1,
                    responsive: true,
                    height: 'auto',
                    align: 'center',
                    pagination: $clientsItemsPagination,
                    scroll: {
                        pauseOnHover: true
                    }
                });
            });
        }
        $('.gem-clients-type-carousel-grid:not(.carousel-disabled)', this).each(initClientsGrid);
    }
    $.fn.updateClientsCarousel = function() {
        function initClientsCarousel() {
            if (window.tgpLazyItems !== undefined) {
                var isShowed = window.tgpLazyItems.checkGroupShowed(this, function(node) {
                    initClientsCarousel.call(node);
                });
                if (!isShowed) {
                    return;
                }
            }
            var $clientsElement = $(this);
            var $clientsCarousel = $('.gem-client-carousel', $clientsElement);
            var $clientsPrev = $('.gem-client-prev', $clientsElement);
            var $clientsNext = $('.gem-client-next', $clientsElement);
            var autoscroll = $clientsElement.data('autoscroll') > 0 ? $clientsElement.data('autoscroll') : false;
            $clientsElement.thegemPreloader(function() {
                var $clientsView = $clientsCarousel.carouFredSel({
                    auto: autoscroll,
                    circular: true,
                    infinite: false,
                    scroll: {
                        items: 1
                    },
                    width: '100%',
                    responsive: false,
                    height: 'auto',
                    align: 'center',
                    prev: $clientsPrev,
                    next: $clientsNext
                });
            });
        }
        $('.gem_client_carousel-items:not(.carousel-disabled)', this).each(initClientsCarousel);
    }
}
)(jQuery);
;!function() {
    var i = void 0;
    !function o(a, s, c) {
        function l(t, e) {
            if (!s[t]) {
                if (!a[t]) {
                    var r = !1;
                    if (!e && r)
                        return r(t, !0);
                    if (u)
                        return u(t, !0);
                    var n = new Error("Cannot find module '" + t + "'");
                    throw n.code = "MODULE_NOT_FOUND",
                    n
                }
                var i = s[t] = {
                    exports: {}
                };
                a[t][0].call(i.exports, function(e) {
                    return l(a[t][1][e] || e)
                }, i, i.exports, o, a, s, c)
            }
            return s[t].exports
        }
        for (var u = !1, e = 0; e < c.length; e++)
            l(c[e]);
        return l
    }({
        1: [function(e, t, r) {
            "use strict";
            var n, i = (n = e("./forms/conditional-elements.js")) && n.__esModule ? n : {
                default: n
            };
            var o = window.mc4wp || {}
              , a = e("gator")
              , s = e("./forms/forms.js")
              , c = window.mc4wp_forms_config || {}
              , l = e("./misc/scroll-to-element.js");
            var u, f, d, m, h, p, g = a(document.body);
            if (g.on("submit", ".mc4wp-form", function(e) {
                var t = s.getByElement(e.target || e.srcElement);
                e.defaultPrevented || s.trigger(t.id + ".submit", [t, e]),
                e.defaultPrevented || s.trigger("submit", [t, e])
            }),
            g.on("focus", ".mc4wp-form", function(e) {
                var t = s.getByElement(e.target || e.srcElement);
                t.started || (s.trigger(t.id + ".started", [t, e]),
                s.trigger("started", [t, e]),
                t.started = !0)
            }),
            g.on("change", ".mc4wp-form", function(e) {
                var t = s.getByElement(e.target || e.srcElement);
                s.trigger("change", [t, e]),
                s.trigger(t.id + ".change", [t, e])
            }),
            i.default.init(),
            o.listeners) {
                for (var v = o.listeners, y = 0; y < v.length; y++)
                    s.on(v[y].event, v[y].callback);
                delete o.listeners
            }
            if (o.forms = s,
            c.submitted_form) {
                var b = c.submitted_form
                  , w = document.getElementById(b.element_id)
                  , E = s.getByElement(w);
                u = E,
                f = b.event,
                d = b.errors,
                m = b.data,
                h = Date.now(),
                p = document.body.clientHeight,
                d && u.setData(m),
                window.scrollY <= 10 && c.auto_scroll && l(u.element),
                window.addEventListener("load", function() {
                    s.trigger(u.id + ".submitted", [u]),
                    s.trigger("submitted", [u]),
                    d ? (s.trigger(u.id + ".error", [u, d]),
                    s.trigger("error", [u, d])) : (s.trigger(u.id + ".success", [u, m]),
                    s.trigger("success", [u, m]),
                    s.trigger(u.id + "." + f, [u, m]),
                    s.trigger(f, [u, m]),
                    "updated_subscriber" === f && (s.trigger(u.id + ".subscribed", [u, m, !0]),
                    s.trigger("subscribed", [u, m, !0])));
                    var e = Date.now() - h;
                    c.auto_scroll && 1e3 < e && e < 2e3 && document.body.clientHeight !== p && l(u.element)
                })
            }
            window.mc4wp = o
        }
        , {
            "./forms/conditional-elements.js": 2,
            "./forms/forms.js": 4,
            "./misc/scroll-to-element.js": 5,
            gator: 7
        }],
        2: [function(e, t, r) {
            "use strict";
            function n(e) {
                for (var t = !!e.getAttribute("data-show-if"), r = t ? e.getAttribute("data-show-if").split(":") : e.getAttribute("data-hide-if").split(":"), n = r[0], i = (1 < r.length ? r[1] : "*").split("|"), o = function(e, t) {
                    for (var r = [], n = e.querySelectorAll('input[name="' + t + '"], select[name="' + t + '"], textarea[name="' + t + '"]'), i = 0; i < n.length; i++) {
                        var o = n[i]
                          , a = o.getAttribute("type");
                        ("radio" !== a && "checkbox" !== a || o.checked) && r.push(o.value)
                    }
                    return r
                }(function(e) {
                    for (var t = e; t.parentElement; )
                        if ("FORM" === (t = t.parentElement).tagName)
                            return t;
                    return null
                }(e), n), a = !1, s = 0; s < o.length; s++) {
                    var c = o[s];
                    if (a = -1 < i.indexOf(c) || -1 < i.indexOf("*") && 0 < c.length)
                        break
                }
                e.style.display = t ? a ? "" : "none" : a ? "none" : "";
                var l = e.querySelectorAll("input, select, textarea");
                [].forEach.call(l, function(e) {
                    (a || t) && e.getAttribute("data-was-required") && (e.required = !0,
                    e.removeAttribute("data-was-required")),
                    a && t || !e.required || (e.setAttribute("data-was-required", "true"),
                    e.required = !1)
                })
            }
            function i() {
                var e = document.querySelectorAll(".mc4wp-form [data-show-if], .mc4wp-form [data-hide-if]");
                [].forEach.call(e, n)
            }
            function o(e) {
                if (e.target && e.target.form && !(e.target.form.className.indexOf("mc4wp-form") < 0)) {
                    var t = e.target.form.querySelectorAll("[data-show-if], [data-hide-if]");
                    [].forEach.call(t, n)
                }
            }
            Object.defineProperty(r, "__esModule", {
                value: !0
            }),
            r.default = void 0;
            var a = {
                init: function() {
                    document.addEventListener("keyup", o, !0),
                    document.addEventListener("change", o, !0),
                    document.addEventListener("mc4wp-refresh", i, !0),
                    window.addEventListener("load", i),
                    i()
                }
            };
            r.default = a
        }
        , {}],
        3: [function(e, t, r) {
            "use strict";
            function n(e, t) {
                this.id = e,
                this.element = t || document.createElement("form"),
                this.name = this.element.getAttribute("data-name") || "Form #" + this.id,
                this.errors = [],
                this.started = !1
            }
            var i = e("form-serialize")
              , o = e("populate.js");
            n.prototype.setData = function(e) {
                try {
                    o(this.element, e)
                } catch (e) {
                    console.error(e)
                }
            }
            ,
            n.prototype.getData = function() {
                return i(this.element, {
                    hash: !0,
                    empty: !0
                })
            }
            ,
            n.prototype.getSerializedData = function() {
                return i(this.element, {
                    hash: !1,
                    empty: !0
                })
            }
            ,
            n.prototype.setResponse = function(e) {
                this.element.querySelector(".mc4wp-response").innerHTML = e
            }
            ,
            n.prototype.reset = function() {
                this.setResponse(""),
                this.element.querySelector(".mc4wp-form-fields").style.display = "",
                this.element.reset()
            }
            ,
            t.exports = n
        }
        , {
            "form-serialize": 6,
            "populate.js": 8
        }],
        4: [function(e, t, r) {
            "use strict";
            var n = e("./form.js")
              , i = []
              , o = {};
            function a(e, t) {
                o[e] = o[e] || [],
                o[e].forEach(function(e) {
                    return e.apply(null, t)
                })
            }
            function s(e, t) {
                t = t || parseInt(e.getAttribute("data-id")) || 0;
                var r = new n(t,e);
                return i.push(r),
                r
            }
            t.exports = {
                all: function() {
                    return i
                },
                get: function(e) {
                    e = parseInt(e);
                    for (var t = 0; t < i.length; t++)
                        if (i[t].id === e)
                            return i[t];
                    return s(document.querySelector(".mc4wp-form-" + e), e)
                },
                getByElement: function(e) {
                    for (var t = e.form || e, r = 0; r < i.length; r++)
                        if (i[r].element === t)
                            return i[r];
                    return s(t)
                },
                on: function(e, t) {
                    o[e] = o[e] || [],
                    o[e].push(t)
                },
                off: function(e, t) {
                    o[e] = o[e] || [],
                    o[e] = o[e].filter(function(e) {
                        return e !== t
                    })
                },
                trigger: function(e, t) {
                    "submit" === e || 0 < e.indexOf(".submit") ? a(e, t) : window.setTimeout(function() {
                        a(e, t)
                    }, 1)
                }
            }
        }
        , {
            "./form.js": 3
        }],
        5: [function(e, t, r) {
            "use strict";
            t.exports = function(e) {
                var t = window.pageXOffset || document.documentElement.scrollLeft
                  , r = function(e) {
                    var t = document.body
                      , r = document.documentElement
                      , n = e.getBoundingClientRect()
                      , i = r.clientHeight
                      , o = Math.max(t.scrollHeight, t.offsetHeight, r.clientHeight, r.scrollHeight, r.offsetHeight)
                      , a = n.bottom - i / 2 - n.height / 2
                      , s = o - i;
                    return Math.min(a + window.pageYOffset, s)
                }(e);
                window.scrollTo(t, r)
            }
        }
        , {}],
        6: [function(e, t, r) {
            var g = /^(?:submit|button|image|reset|file)$/i
              , v = /^(?:input|select|textarea|keygen)/i
              , i = /(\[[^\[\]]*\])/g;
            function y(e, t, r) {
                if (t.match(i)) {
                    !function e(t, r, n) {
                        if (0 === r.length)
                            return t = n;
                        var i = r.shift()
                          , o = i.match(/^\[(.+?)\]$/);
                        if ("[]" === i)
                            return t = t || [],
                            Array.isArray(t) ? t.push(e(null, r, n)) : (t._values = t._values || [],
                            t._values.push(e(null, r, n))),
                            t;
                        if (o) {
                            var a = o[1]
                              , s = +a;
                            isNaN(s) ? (t = t || {})[a] = e(t[a], r, n) : (t = t || [])[s] = e(t[s], r, n)
                        } else
                            t[i] = e(t[i], r, n);
                        return t
                    }(e, function(e) {
                        var t = []
                          , r = new RegExp(i)
                          , n = /^([^\[\]]*)/.exec(e);
                        for (n[1] && t.push(n[1]); null !== (n = r.exec(e)); )
                            t.push(n[1]);
                        return t
                    }(t), r)
                } else {
                    var n = e[t];
                    n ? (Array.isArray(n) || (e[t] = [n]),
                    e[t].push(r)) : e[t] = r
                }
                return e
            }
            function b(e, t, r) {
                return r = r.replace(/(\r)?\n/g, "\r\n"),
                r = (r = encodeURIComponent(r)).replace(/%20/g, "+"),
                e + (e ? "&" : "") + encodeURIComponent(t) + "=" + r
            }
            t.exports = function(e, t) {
                "object" != typeof t ? t = {
                    hash: !!t
                } : void 0 === t.hash && (t.hash = !0);
                for (var r = t.hash ? {} : "", n = t.serializer || (t.hash ? y : b), i = e && e.elements ? e.elements : [], o = Object.create(null), a = 0; a < i.length; ++a) {
                    var s = i[a];
                    if ((t.disabled || !s.disabled) && s.name && (v.test(s.nodeName) && !g.test(s.type))) {
                        var c = s.name
                          , l = s.value;
                        if ("checkbox" !== s.type && "radio" !== s.type || s.checked || (l = void 0),
                        t.empty) {
                            if ("checkbox" !== s.type || s.checked || (l = ""),
                            "radio" === s.type && (o[s.name] || s.checked ? s.checked && (o[s.name] = !0) : o[s.name] = !1),
                            null == l && "radio" == s.type)
                                continue
                        } else if (!l)
                            continue;
                        if ("select-multiple" !== s.type)
                            r = n(r, c, l);
                        else {
                            l = [];
                            for (var u = s.options, f = !1, d = 0; d < u.length; ++d) {
                                var m = u[d]
                                  , h = t.empty && !m.value
                                  , p = m.value || h;
                                m.selected && p && (f = !0,
                                r = t.hash && "[]" !== c.slice(c.length - 2) ? n(r, c + "[]", m.value) : n(r, c, m.value))
                            }
                            !f && t.empty && (r = n(r, c, ""))
                        }
                    }
                }
                if (t.empty)
                    for (var c in o)
                        o[c] || (r = n(r, c, ""));
                return r
            }
        }
        , {}],
        7: [function(e, t, r) {
            function f(e, t, r) {
                return "_root" == t ? r : e !== r ? function(e) {
                    return i || (i = e.matches ? e.matches : e.webkitMatchesSelector ? e.webkitMatchesSelector : e.mozMatchesSelector ? e.mozMatchesSelector : e.msMatchesSelector ? e.msMatchesSelector : e.oMatchesSelector ? e.oMatchesSelector : m.matchesSelector)
                }(e).call(e, t) ? e : e.parentNode ? (h++,
                f(e.parentNode, t, r)) : void 0 : void 0
            }
            function d(e, t, r, n) {
                if (p[e.id])
                    if (t)
                        if (n || r)
                            if (n) {
                                if (p[e.id][t][r])
                                    for (var i = 0; i < p[e.id][t][r].length; i++)
                                        if (p[e.id][t][r][i] === n) {
                                            p[e.id][t][r].splice(i, 1);
                                            break
                                        }
                            } else
                                delete p[e.id][t][r];
                        else
                            p[e.id][t] = {};
                    else
                        for (var o in p[e.id])
                            p[e.id].hasOwnProperty(o) && (p[e.id][o] = {})
            }
            function n(e, t, r, n) {
                if (this.element) {
                    e instanceof Array || (e = [e]),
                    r || "function" != typeof t || (r = t,
                    t = "_root");
                    var i, o, a, s, c, l = this.id;
                    for (i = 0; i < e.length; i++)
                        n ? d(this, e[i], t, r) : (p[l] && p[l][e[i]] || m.addEvent(this, e[i], u(e[i])),
                        o = this,
                        a = e[i],
                        s = t,
                        c = r,
                        p[o.id] || (p[o.id] = {}),
                        p[o.id][a] || (p[o.id][a] = {}),
                        p[o.id][a][s] || (p[o.id][a][s] = []),
                        p[o.id][a][s].push(c));
                    return this
                }
                function u(t) {
                    return function(e) {
                        !function(e, t, r) {
                            if (p[e][r]) {
                                var n, i, o = t.target || t.srcElement, a = {}, s = 0, c = 0;
                                for (n in h = 0,
                                p[e][r])
                                    p[e][r].hasOwnProperty(n) && (i = f(o, n, g[e].element)) && m.matchesEvent(r, g[e].element, i, "_root" == n, t) && (h++,
                                    p[e][r][n].match = i,
                                    a[h] = p[e][r][n]);
                                for (t.stopPropagation = function() {
                                    t.cancelBubble = !0
                                }
                                ,
                                s = 0; s <= h; s++)
                                    if (a[s])
                                        for (c = 0; c < a[s].length; c++) {
                                            if (!1 === a[s][c].call(a[s].match, t))
                                                return m.cancel(t);
                                            if (t.cancelBubble)
                                                return
                                        }
                            }
                        }(l, e, t)
                    }
                }
            }
            function m(e, t) {
                if (!(this instanceof m)) {
                    for (var r in g)
                        if (g[r].element === e)
                            return g[r];
                    return g[++o] = new m(e,o),
                    g[o]
                }
                this.element = e,
                this.id = t
            }
            var i, h, o, p, g;
            o = h = 0,
            p = {},
            g = {},
            m.prototype.on = function(e, t, r) {
                return n.call(this, e, t, r)
            }
            ,
            m.prototype.off = function(e, t, r) {
                return n.call(this, e, t, r, !0)
            }
            ,
            m.matchesSelector = function() {}
            ,
            m.cancel = function(e) {
                e.preventDefault(),
                e.stopPropagation()
            }
            ,
            m.addEvent = function(e, t, r) {
                var n = "blur" == t || "focus" == t;
                e.element.addEventListener(t, r, n)
            }
            ,
            m.matchesEvent = function() {
                return !0
            }
            ,
            void 0 !== t && t.exports && (t.exports = m),
            window.Gator = m
        }
        , {}],
        8: [function(e, t, r) {
            var n, u;
            n = this,
            u = function(e, t, r) {
                for (var n in t)
                    if (t.hasOwnProperty(n)) {
                        var i = n
                          , o = t[n];
                        if (void 0 === o && (o = ""),
                        null === o && (o = ""),
                        void 0 !== r && (i = r + "[" + n + "]"),
                        o.constructor === Array)
                            i += "[]";
                        else if ("object" == typeof o) {
                            u(e, o, i);
                            continue
                        }
                        var a = e.elements.namedItem(i);
                        if (a)
                            switch (a.type || a[0].type) {
                            default:
                                a.value = o;
                                break;
                            case "radio":
                            case "checkbox":
                                for (var s = 0; s < a.length; s++)
                                    a[s].checked = -1 < o.indexOf(a[s].value);
                                break;
                            case "select-multiple":
                                for (var c = o.constructor == Array ? o : [o], l = 0; l < a.options.length; l++)
                                    a.options[l].selected |= -1 < c.indexOf(a.options[l].value);
                                break;
                            case "select":
                            case "select-one":
                                a.value = o.toString() || o;
                                break;
                            case "date":
                                a.value = new Date(o).toISOString().split("T")[0]
                            }
                    }
            }
            ,
            "function" == typeof i && "object" == typeof i.amd && i.amd ? i(function() {
                return u
            }) : void 0 !== t && t.exports ? t.exports = u : n.populate = u
        }
        , {}]
    }, {}, [1])
}();
//# sourceMappingURL=forms-api.min.js.map

;/* Placeholders.js v4.0.1 */
/*!
 * The MIT License
 *
 * Copyright (c) 2012 James Allardice
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
!function(a) {
    "use strict";
    function b() {}
    function c() {
        try {
            return document.activeElement
        } catch (a) {}
    }
    function d(a, b) {
        for (var c = 0, d = a.length; d > c; c++)
            if (a[c] === b)
                return !0;
        return !1
    }
    function e(a, b, c) {
        return a.addEventListener ? a.addEventListener(b, c, !1) : a.attachEvent ? a.attachEvent("on" + b, c) : void 0
    }
    function f(a, b) {
        var c;
        a.createTextRange ? (c = a.createTextRange(),
        c.move("character", b),
        c.select()) : a.selectionStart && (a.focus(),
        a.setSelectionRange(b, b))
    }
    function g(a, b) {
        try {
            return a.type = b,
            !0
        } catch (c) {
            return !1
        }
    }
    function h(a, b) {
        if (a && a.getAttribute(B))
            b(a);
        else
            for (var c, d = a ? a.getElementsByTagName("input") : N, e = a ? a.getElementsByTagName("textarea") : O, f = d ? d.length : 0, g = e ? e.length : 0, h = f + g, i = 0; h > i; i++)
                c = f > i ? d[i] : e[i - f],
                b(c)
    }
    function i(a) {
        h(a, k)
    }
    function j(a) {
        h(a, l)
    }
    function k(a, b) {
        var c = !!b && a.value !== b
          , d = a.value === a.getAttribute(B);
        if ((c || d) && "true" === a.getAttribute(C)) {
            a.removeAttribute(C),
            a.value = a.value.replace(a.getAttribute(B), ""),
            a.className = a.className.replace(A, "");
            var e = a.getAttribute(I);
            parseInt(e, 10) >= 0 && (a.setAttribute("maxLength", e),
            a.removeAttribute(I));
            var f = a.getAttribute(D);
            return f && (a.type = f),
            !0
        }
        return !1
    }
    function l(a) {
        var b = a.getAttribute(B);
        if ("" === a.value && b) {
            a.setAttribute(C, "true"),
            a.value = b,
            a.className += " " + z;
            var c = a.getAttribute(I);
            c || (a.setAttribute(I, a.maxLength),
            a.removeAttribute("maxLength"));
            var d = a.getAttribute(D);
            return d ? a.type = "text" : "password" === a.type && g(a, "text") && a.setAttribute(D, "password"),
            !0
        }
        return !1
    }
    function m(a) {
        return function() {
            P && a.value === a.getAttribute(B) && "true" === a.getAttribute(C) ? f(a, 0) : k(a)
        }
    }
    function n(a) {
        return function() {
            l(a)
        }
    }
    function o(a) {
        return function() {
            i(a)
        }
    }
    function p(a) {
        return function(b) {
            return v = a.value,
            "true" === a.getAttribute(C) && v === a.getAttribute(B) && d(x, b.keyCode) ? (b.preventDefault && b.preventDefault(),
            !1) : void 0
        }
    }
    function q(a) {
        return function() {
            k(a, v),
            "" === a.value && (a.blur(),
            f(a, 0))
        }
    }
    function r(a) {
        return function() {
            a === c() && a.value === a.getAttribute(B) && "true" === a.getAttribute(C) && f(a, 0)
        }
    }
    function s(a) {
        var b = a.form;
        b && "string" == typeof b && (b = document.getElementById(b),
        b.getAttribute(E) || (e(b, "submit", o(b)),
        b.setAttribute(E, "true"))),
        e(a, "focus", m(a)),
        e(a, "blur", n(a)),
        P && (e(a, "keydown", p(a)),
        e(a, "keyup", q(a)),
        e(a, "click", r(a))),
        a.setAttribute(F, "true"),
        a.setAttribute(B, T),
        (P || a !== c()) && l(a)
    }
    var t = document.createElement("input")
      , u = void 0 !== t.placeholder;
    if (a.Placeholders = {
        nativeSupport: u,
        disable: u ? b : i,
        enable: u ? b : j
    },
    !u) {
        var v, w = ["text", "search", "url", "tel", "email", "password", "number", "textarea"], x = [27, 33, 34, 35, 36, 37, 38, 39, 40, 8, 46], y = "#ccc", z = "placeholdersjs", A = new RegExp("(?:^|\\s)" + z + "(?!\\S)"), B = "data-placeholder-value", C = "data-placeholder-active", D = "data-placeholder-type", E = "data-placeholder-submit", F = "data-placeholder-bound", G = "data-placeholder-focus", H = "data-placeholder-live", I = "data-placeholder-maxlength", J = 100, K = document.getElementsByTagName("head")[0], L = document.documentElement, M = a.Placeholders, N = document.getElementsByTagName("input"), O = document.getElementsByTagName("textarea"), P = "false" === L.getAttribute(G), Q = "false" !== L.getAttribute(H), R = document.createElement("style");
        R.type = "text/css";
        var S = document.createTextNode("." + z + " {color:" + y + ";}");
        R.styleSheet ? R.styleSheet.cssText = S.nodeValue : R.appendChild(S),
        K.insertBefore(R, K.firstChild);
        for (var T, U, V = 0, W = N.length + O.length; W > V; V++)
            U = V < N.length ? N[V] : O[V - N.length],
            T = U.attributes.placeholder,
            T && (T = T.nodeValue,
            T && d(w, U.type) && s(U));
        var X = setInterval(function() {
            for (var a = 0, b = N.length + O.length; b > a; a++)
                U = a < N.length ? N[a] : O[a - N.length],
                T = U.attributes.placeholder,
                T ? (T = T.nodeValue,
                T && d(w, U.type) && (U.getAttribute(F) || s(U),
                (T !== U.getAttribute(B) || "password" === U.type && !U.getAttribute(D)) && ("password" === U.type && !U.getAttribute(D) && g(U, "text") && U.setAttribute(D, "password"),
                U.value === U.getAttribute(B) && (U.value = T),
                U.setAttribute(B, T)))) : U.getAttribute(C) && (k(U),
                U.removeAttribute(B));
            Q || clearInterval(X)
        }, J);
        e(a, "beforeunload", function() {
            M.disable()
        })
    }
}(this);
