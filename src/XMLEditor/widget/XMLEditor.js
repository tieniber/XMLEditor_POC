define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-geometry",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "XMLEditor/lib/jquery-1.11.2",
    "dojo/text!XMLEditor/widget/template/XMLEditor.html"
], function(declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoGeometry, dojoClass, dojoStyle, dojoConstruct, dojoArray, lang, dojoText, dojoHtml, dojoEvent, _jQuery, widgetTemplate) {
    "use strict";

    var $ = _jQuery.noConflict(true);

    return declare("XMLEditor.widget.XMLEditor", [_WidgetBase, _TemplatedMixin], {

        templateString: widgetTemplate,

        widgetBase: null,
        //editor: null,
        field: null,
        node: null,
        onClickMicroflow: null,
        // Internal variables.
        _handles: null,
        _contextObj: null,

        constructor: function() {
            this._handles = [];
        },

        postCreate: function() {
            logger.debug(this.id + ".postCreate");
            ace.config.set('basePath', '/widgets/XMLEditor/lib/');

        },

        update: function(obj, callback) {
            logger.debug(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();

            this._setupEditor();            
            this._updateRendering(callback);
        },

        resize: function(box) {
            logger.debug(this.id + ".resize");
        },

        uninitialize: function() {
            logger.debug(this.id + ".uninitialize");
        },

        _setupEditor: function() {
            this.editor = ace.edit(this.node);
            this.editor.getSession().setUseWorker(false);
            // add the listener to update the context object when the editor's value changes
            this.editor.on("change", function(data) {
                this._justchanged = true;
                this._contextObj.set(this.field, this.editor.getValue());
            }.bind(this));

            this.editor.setTheme("ace/theme/tomorrow");
            this.editor.getSession().setMode("ace/mode/xml");
        },

        _updateRendering: function(callback) {
            if (!this._justchanged) {
                var value = "" + this._contextObj.get(this.field);
                this.editor.setValue(value);
            }
            this._justchanged = false;
            this._executeCallback(callback, "_updateRendering");
        },


        // Shorthand for executing a callback, adds logging to your inspector
        _executeCallback: function(cb, from) {
            logger.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        },

        // Reset subscriptions.
        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");
            // Release handles on previous object, if any.
            this.unsubscribeAll();

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: lang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.field,
                    callback: lang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });
            }
        }
    });
});

require(["XMLEditor/widget/XMLEditor"]);