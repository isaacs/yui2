/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The ColumnSet class defines and manages a DataTable's Columns,
 * including nested hierarchies and access to individual Column instances.
 *
 * @namespace YAHOO.widget
 * @class ColumnSet
 * @uses YAHOO.util.EventProvider
 * @constructor
 * @param aHeaders {Object[]} Array of object literals that define header cells.
 */
YAHOO.widget.ColumnSet = function(aHeaders) {
    this._sName = "instance" + YAHOO.widget.ColumnSet._nCount;

    // DOM tree representation of all Columns
    var tree = [];
    // Flat representation of all Columns
    var flat = [];
    // Flat representation of only Columns that are meant to display data
    var keys = [];
    // Array of HEADERS attribute values for all keys in the "keys" array
    var headers = [];

    // Tracks current node list depth being tracked
    var nodeDepth = -1;

    // Internal recursive function to defined Column instances
    var parseColumns = function(nodeList, parent) {
        // One level down
        nodeDepth++;

        // Create corresponding tree node if not already there for this depth
        if(!tree[nodeDepth]) {
            tree[nodeDepth] = [];
        }


        // Parse each node at this depth for attributes and any children
        for(var j=0; j<nodeList.length; j++) {
            var currentNode = nodeList[j];

            // Instantiate a new Column for each node
            var oColumn = new YAHOO.widget.Column(currentNode);

            // Add the new Column to the flat list
            flat.push(oColumn);

            // Assign its parent as an attribute, if applicable
            if(parent) {
                oColumn.parent = parent;
            }

            // The Column has descendants
            if(YAHOO.lang.isArray(currentNode.children)) {
                oColumn.children = currentNode.children;

                // Determine COLSPAN value for this Column
                var terminalChildNodes = 0;
                var countTerminalChildNodes = function(ancestor) {
                    var descendants = ancestor.children;
                    // Drill down each branch and count terminal nodes
                    for(var k=0; k<descendants.length; k++) {
                        // Keep drilling down
                        if(YAHOO.lang.isArray(descendants[k].children)) {
                            countTerminalChildNodes(descendants[k]);
                        }
                        // Reached branch terminus
                        else {
                            terminalChildNodes++;
                        }
                    }
                };
                countTerminalChildNodes(currentNode);
                oColumn._colspan = terminalChildNodes;

                // Cascade certain properties to children if not defined on their own
                var currentChildren = currentNode.children;
                for(var k=0; k<currentChildren.length; k++) {
                    var child = currentChildren[k];
                    if(oColumn.className && (child.className === undefined)) {
                        child.className = oColumn.className;
                    }
                    if(oColumn.editor && (child.editor === undefined)) {
                        child.editor = oColumn.editor;
                    }
                    if(oColumn.editorOptions && (child.editorOptions === undefined)) {
                        child.editorOptions = oColumn.editorOptions;
                    }
                    if(oColumn.formatter && (child.formatter === undefined)) {
                        child.formatter = oColumn.formatter;
                    }
                    /*TODO: delete if(oColumn.parser && (child.parser === undefined)) {
                        child.parser = oColumn.parser;
                    }*/
                    if(oColumn.resizeable && (child.resizeable === undefined)) {
                        child.resizeable = oColumn.resizeable;
                    }
                    if(oColumn.sortable && (child.sortable === undefined)) {
                        child.sortable = oColumn.sortable;
                    }
                    /*if(oColumn.type && (child.type === undefined)) {
                        child.type = oColumn.type;
                    }*/
                    if(oColumn.width && (child.width === undefined)) {
                        child.width = oColumn.width;
                    }
                }

                // The children themselves must also be parsed for Column instances
                if(!tree[nodeDepth+1]) {
                    tree[nodeDepth+1] = [];
                }
                parseColumns(currentChildren, oColumn);
            }
            // This Column does not have any children
            else {
                oColumn._index = keys.length;
                oColumn._colspan = 1;
                keys.push(oColumn);
            }

            // Add the Column to the top-down tree
            tree[nodeDepth].push(oColumn);
        }
        nodeDepth--;
    };

    // Parse out Column instances from the array of object literals
    if(YAHOO.lang.isArray(aHeaders)) {
        parseColumns(aHeaders);
    }

    // Determine ROWSPAN value for each Column in the tree
    var parseTreeForRowspan = function(tree) {
        var maxRowDepth = 1;
        var currentRow;
        var currentColumn;

        // Calculate the max depth of descendants for this row
        var countMaxRowDepth = function(row, tmpRowDepth) {
            tmpRowDepth = tmpRowDepth || 1;

            for(var n=0; n<row.length; n++) {
                var col = row[n];
                // Column has children, so keep counting
                if(YAHOO.lang.isArray(col.children)) {
                    tmpRowDepth++;
                    countMaxRowDepth(col.children, tmpRowDepth);
                    tmpRowDepth--;
                }
                // No children, is it the max depth?
                else {
                    if(tmpRowDepth > maxRowDepth) {
                        maxRowDepth = tmpRowDepth;
                    }
                }

            }
        };

        // Count max row depth for each row
        for(var m=0; m<tree.length; m++) {
            currentRow = tree[m];
            countMaxRowDepth(currentRow);

            // Assign the right ROWSPAN values to each Column in the row
            for(var p=0; p<currentRow.length; p++) {
                currentColumn = currentRow[p];
                if(!YAHOO.lang.isArray(currentColumn.children)) {
                    currentColumn._rowspan = maxRowDepth;
                }
                else {
                    currentColumn._rowspan = 1;
                }
            }

            // Reset counter for next row
            maxRowDepth = 1;
        }
    };
    parseTreeForRowspan(tree);





    // Store header relationships in an array for HEADERS attribute
    var recurseAncestorsForHeaders = function(i, oColumn) {
        headers[i].push(oColumn._nId);
        if(oColumn.parent) {
            recurseAncestorsForHeaders(i, oColumn.parent);
        }
    };
    for(var i=0; i<keys.length; i++) {
        headers[i] = [];
        recurseAncestorsForHeaders(i, keys[i]);
        headers[i] = headers[i].reverse();
        headers[i] = headers[i].join(" ");
    }

    // Save to the ColumnSet instance
    this.tree = tree;
    this.flat = flat;
    this.keys = keys;
    this.headers = headers;

    YAHOO.widget.ColumnSet._nCount++;
    YAHOO.log("ColumnSet initialized", "info", this.toString());
};

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Internal class variable to index multiple data table instances.
 *
 * @property ColumnSet._nCount
 * @type number
 * @private
 * @static
 */
YAHOO.widget.ColumnSet._nCount = 0;

/**
 * Unique instance name.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.widget.ColumnSet.prototype._sName = null;

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Top-down tree representation of Column hierarchy.
 *
 * @property tree
 * @type YAHOO.widget.Column[]
 */
YAHOO.widget.ColumnSet.prototype.tree = null;

/**
 * Flattened representation of all Columns.
 *
 * @property flat
 * @type YAHOO.widget.Column[]
 * @default []
 */
YAHOO.widget.ColumnSet.prototype.flat = null;

/**
 * Array of Columns that map one-to-one to a table column.
 *
 * @property keys
 * @type YAHOO.widget.Column[]
 * @default []
 */
YAHOO.widget.ColumnSet.prototype.keys = null;

/**
 * ID index of nested parent hierarchies for HEADERS accessibility attribute.
 *
 * @property headers
 * @type String[]
 * @default []
 */
YAHOO.widget.ColumnSet.prototype.headers = null;

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Public accessor to the unique name of the ColumnSet instance.
 *
 * @method toString
 * @return {String} Unique name of the ColumnSet instance.
 */

YAHOO.widget.ColumnSet.prototype.toString = function() {
    return "ColumnSet " + this._sName;
};

/**
 * Returns Column instance with given ID number or key.
 *
 * @method getColumn
 * @param column {Number | String} ID number or unique key.
 * @return {YAHOO.widget.Column} Column instance.
 */

YAHOO.widget.ColumnSet.prototype.getColumn = function(column) {
    var allColumns = this.flat;
    if(YAHOO.lang.isNumber(column)) {
        for(var i=0; i<allColumns.length; i++) {
            if(allColumns[i]._nId === column) {
                return allColumns[i];
            }
        }
    }
    else if(YAHOO.lang.isString(column)) {
        for(i=0; i<allColumns.length; i++) {
            if(allColumns[i].key === column) {
                return allColumns[i];
            }
        }
    }
    return null;
};

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * The Column class defines and manages attributes of DataTable Columns
 *
 * @namespace YAHOO.widget
 * @class Column
 * @constructor
 * @param oConfigs {Object} Object literal of configuration values.
 */
YAHOO.widget.Column = function(oConfigs) {
    // Internal variables
    this._nId = YAHOO.widget.Column._nCount;
    this._sName = "Column instance" + this._nId;

    // Object literal defines Column attributes
    if(oConfigs && (oConfigs.constructor == Object)) {
        for(var sConfig in oConfigs) {
            if(sConfig) {
                this[sConfig] = oConfigs[sConfig];
            }
        }
    }

    if(!YAHOO.lang.isValue(this.key)) {
        this.key = "yui-dt-column"+this._nId;
    }
    YAHOO.widget.Column._nCount++;
};

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Internal instance counter.
 *
 * @property Column._nCount
 * @type Number
 * @static
 * @default 0
 */
YAHOO.widget.Column._nCount = 0;

/**
 * Unique instance name.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.widget.Column.prototype._sName = null;


/**
 * Unique number assigned at instantiation, indicates original order within
 * ColumnSet.
 *
 * @property _nId
 * @type String
 * @private
 */
YAHOO.widget.Column.prototype._nId = null;

/**
 * Reference to Column's index within its ColumnSet's keys array, or null if not applicable.
 *
 * @property _index
 * @type Number
 * @private
 */
YAHOO.widget.Column.prototype._index = null;

/**
 * Number of table cells the Column spans.
 *
 * @property _colspan
 * @type Number
 * @private
 */
YAHOO.widget.Column.prototype._colspan = 1;

/**
 * Number of table rows the Column spans.
 *
 * @property _rowspan
 * @type Number
 * @private
 */
YAHOO.widget.Column.prototype._rowspan = 1;

/**
 * Column's parent Column instance, or null.
 *
 * @property _parent
 * @type YAHOO.widget.Column
 * @private
 */
YAHOO.widget.Column.prototype._parent = null;

/**
 * Current offsetWidth of the Column (in pixels).
 *
 * @property _width
 * @type Number
 * @private
 */
YAHOO.widget.Column.prototype._width = null;

/**
 * Minimum width the Column can support (in pixels). Value is populated only if table
 * is fixedWidth, null otherwise.
 *
 * @property _minWidth
 * @type Number
 * @private
 */
YAHOO.widget.Column.prototype._minWidth = null;

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Associated database field, or null.
 *
 * @property key
 * @type String
 */
YAHOO.widget.Column.prototype.key = null;

/**
 * Text or HTML for display as Column's label in the TH element.
 *
 * @property label
 * @type String
 */
YAHOO.widget.Column.prototype.label = null;

/*TODO: delete
 * Data types: "string", "number", "date", "currency", "checkbox", "select",
 * "email", "link".
 *
 * @property type
 * @type String
 * @default "string"
 */
//YAHOO.widget.Column.prototype.type = "string";

/**
 * Column head cell ABBR for accessibility.
 *
 * @property abbr
 * @type String
 */
YAHOO.widget.Column.prototype.abbr = null;

/**
 * Array of object literals that define children (nested headers) of a Column.
 *
 * @property children
 * @type Object[]
 */
YAHOO.widget.Column.prototype.children = null;

/**
 * Column width.
 *
 * @property width
 * @type String
 */
YAHOO.widget.Column.prototype.width = null;

/**
 * Custom CSS class or array of classes to be applied to every cell in the Column.
 *
 * @property className
 * @type String || String[]
 */
YAHOO.widget.Column.prototype.className = null;

/**
 * Defines a format function.
 *
 * @property formatter
 * @type String || HTMLFunction
 */
YAHOO.widget.Column.prototype.formatter = null;

/*TODO: delete
 * Defines a custom parse function for Column, otherwise default is used,
 * according to Column type.
 *
 * @property parser
 * @type HTMLFunction
 */
//YAHOO.widget.Column.prototype.parser = null;

/**
 * Defines an editor function, otherwise Column is not editable.
 *
 * @property editor
 * @type String || HTMLFunction
 */
YAHOO.widget.Column.prototype.editor = null;

/**
 * Defines editor options for Column in an object literal of param:value pairs.
 *
 * @property editorOptions
 * @type Object
 */
YAHOO.widget.Column.prototype.editorOptions = null;

/**
 * True if Column is resizeable, false otherwise.
 *
 * @property resizeable
 * @type Boolean
 * @default false
 */
YAHOO.widget.Column.prototype.resizeable = false;

/**
 * True if Column is sortable, false otherwise.
 *
 * @property sortable
 * @type Boolean
 * @default false
 */
YAHOO.widget.Column.prototype.sortable = false;

/**
 * Default sort order for Column: "asc" or "desc".
 *
 * @property sortOptions.defaultOrder
 * @type String
 * @default null
 */
/**
 * Custom sort handler.
 *
 * @property sortOptions.sortFunction
 * @type Function
 * @default null
 */
YAHOO.widget.Column.prototype.sortOptions = null;















/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Public accessor to the unique name of the Column instance.
 *
 * @method toString
 * @return {String} Column's unique name.
 */
YAHOO.widget.Column.prototype.toString = function() {
    return this._sName;
};

/**
 * Public accessor returns Column's ID string.
 *
 * @method getId
 * @return {String} Column's ID string.
 */
YAHOO.widget.Column.prototype.getId = function() {
    return this._nId;
};

/**
 * Public accessor returns Column's index within its ColumnSet's keys array, or
 * null if not applicable.
 *
 * @property getIndex
 * @return {Number} Column's index within its ColumnSet keys array, if applicable.
 */
YAHOO.widget.Column.prototype.getIndex = function() {
    return this._index;
};

/**
 * Public accessor returns Column's parent instance if any, or null otherwise.
 *
 * @property getParent
 * @return {YAHOO.widget.Column} Column's parent instance.
 */
YAHOO.widget.Column.prototype.getParent = function() {
    return this._parent;
};

/**
 * Public accessor returns Column's calculated COLSPAN value.
 *
 * @property getColspan
 * @return {Number} Column's COLSPAN value.
 */
YAHOO.widget.Column.prototype.getColspan = function() {
    return this._colspan;
};

/**
 * Public accessor returns Column's calculated ROWSPAN value.
 *
 * @property getRowspan
 * @return {Number} Column's ROWSPAN value.
 */
YAHOO.widget.Column.prototype.getRowspan = function() {
    return this._rowspan;
};

/*TODO: delete
 * Takes innerHTML from TD and parses out data for storage in RecordSet.
 *
 * @method parse
 * @param sMarkup {String} The TD's innerHTML value.
 * @return {Object} Data.
 */
/*YAHOO.widget.Column.prototype.parse = function(sMarkup) {
    if(this.parser) {
        return this.parser(sMarkup);
    }
    else {
        var data = null;
        switch(this.type) {
            case "checkbox":
                data = YAHOO.widget.Column.parseCheckbox(sMarkup);
                break;
            case "currency":
                data = YAHOO.widget.Column.parseCurrency(sMarkup);
                break;
            case "date":
                data = YAHOO.widget.Column.parseDate(sMarkup);
                break;
            case "number":
                data = YAHOO.widget.Column.parseNumber(sMarkup);
                break;
            case "select":
                data = YAHOO.widget.Column.parseSelect(sMarkup);
                break;
           default:
                if(sMarkup) {
                    data = sMarkup;
                }
                break;
        }
        return data;
    }
};*/

/*TODO: delete
 * Default parse function for Columns of type "checkbox" takes markup and
 * extracts data. Can be overridden for custom parsing.
 *
 * @method parseCheckbox
 * @param sMarkup
 * @return {bChecked} True if checkbox is checked.
 */
/*YAHOO.widget.Column.parseCheckbox = function(sMarkup) {
    return (sMarkup.indexOf("checked") < 0) ? false : true;
};*/

/*TODO: delete
 * Default parse function for Columns of type "currency" takes markup and
 * extracts data. Can be overridden for custom parsing.
 *
 * @method parseCurrency
 * @param sMarkup
 * @return {nAmount} Floating point amount.
 */
/*YAHOO.widget.Column.parseCurrency = function(sMarkup) {
    return parseFloat(sMarkup.substring(1));
};*/

/*TODO: delete
 * Default parse function for Columns of type "date" takes markup and extracts
 * data. Can be overridden for custom parsing.
 *
 * @method parseDate
 * @param sMarkup
 * @return {oDate} Date instance.
 */
/*YAHOO.widget.Column.parseDate = function(sMarkup) {
    var mm = sMarkup.substring(0,sMarkup.indexOf("/"));
    sMarkup = sMarkup.substring(sMarkup.indexOf("/")+1);
    var dd = sMarkup.substring(0,sMarkup.indexOf("/"));
    var yy = sMarkup.substring(sMarkup.indexOf("/")+1);
    return new Date(yy, mm, dd);
};*/

/*TODO: delete
 * Default parse function for Columns of type "number" takes markup and extracts
 * data. Can be overridden for custom parsing.
 *
 * @method parseNumber
 * @param sMarkup
 * @return {nNumber} Number.
 */
/*YAHOO.widget.Column.parseNumber = function(sMarkup) {
    return parseFloat(sMarkup);
};*/

/*TODO: delete
 * Default parse function for Columns of type "select" takes markup and extracts
 * data. Can be overridden for custom parsing.
 *
 * @method parseSelect
 * @param sMarkup
 * @return {sValue} Value of selected option.
 */
/*YAHOO.widget.Column.parseSelect = function(sMarkup) {
    //return (sMarkup.indexOf("checked") < 0) ? false : true;
};*/

/*TODO: delete
 * Instantiates or retrieves ColumnEditor instance.
 *
 * @method getColumnEditor
 * @param elCell {HTMLElement} The cell to edit.
 * @param oRecord {YAHOO.widget.Record} The DataTable Record of the cell.
 * @return YAHOO.widget.ColumnEditor
 */
/*YAHOO.widget.Column.prototype.getColumnEditor = function(elCell, oRecord) {
//Sync up the arg signature for ColumnEditor constructor and show()
    var oEditor = this.editor;
    if(YAHOO.lang.isString(oEditor)) {
        oEditor = new YAHOO.widget.ColumnEditor(this);
        oEditor.show(elCell, oRecord);
        this.editor = oEditor;
    }
    else if(oEditor instanceof YAHOO.widget.ColumnEditor) {
        oEditor.show(elCell, oRecord, this);
    }
    return oEditor;
};*/


/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * Sort static utility to support Column sorting.
 *
 * @namespace YAHOO.util
 * @class Sort
 * @static
 */
YAHOO.util.Sort = {
    /////////////////////////////////////////////////////////////////////////////
    //
    // Public methods
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Comparator function for simple case-insensitive string sorting.
     *
     * @method compare
     * @param a {Object} First sort argument.
     * @param b {Object} Second sort argument.
     * @param desc {Boolean} True if sort direction is descending, false if
     * sort direction is ascending.
     */
    compare: function(a, b, desc) {
        if((a === null) || (typeof a == "undefined")) {
            if((b === null) || (typeof b == "undefined")) {
                return 0;
            }
            else {
                return 1;
            }
        }
        else if((b === null) || (typeof b == "undefined")) {
            return -1;
        }

        if(a.constructor == String) {
            a = a.toLowerCase();
        }
        if(b.constructor == String) {
            b = b.toLowerCase();
        }
        if(a < b) {
            return (desc) ? 1 : -1;
        }
        else if (a > b) {
            return (desc) ? -1 : 1;
        }
        else {
            return 0;
        }
    }
};

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * ColumnResizer subclasses DragDrop to support resizeable Columns.
 *
 * @namespace YAHOO.util
 * @class ColumnResizer
 * @extends YAHOO.util.DragDrop
 * @constructor
 * @param oDataTable {YAHOO.widget.DataTable} DataTable instance.
 * @param oColumn {YAHOO.widget.Column} Column instance.
 * @param elThead {HTMLElement} TH element reference.
 * @param sHandleElId {String} DOM ID of the handle element that causes the resize.
 * @param sGroup {String} Group name of related DragDrop items.
 * @param oConfig {Object} (Optional) Object literal of config values.
 */
YAHOO.util.ColumnResizer = function(oDataTable, oColumn, elThead, sHandleId, sGroup, oConfig) {
    if(oDataTable && oColumn && elThead && sHandleId) {
        this.datatable = oDataTable;
        this.column = oColumn;
        this.cell = elThead;
        this.init(sHandleId, sGroup, oConfig);
        //this.initFrame();
        this.setYConstraint(0,0);
    }
    else {
        YAHOO.log("Column resizer could not be created due to invalid colElId","warn");
    }
};

if(YAHOO.util.DD) {
    YAHOO.extend(YAHOO.util.ColumnResizer, YAHOO.util.DD);
}

/////////////////////////////////////////////////////////////////////////////
//
// Public DOM event handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Handles mousedown events on the Column resizer.
 *
 * @method onMouseDown
 * @param e {string} The mousedown event
 */
YAHOO.util.ColumnResizer.prototype.onMouseDown = function(e) {
    this.startWidth = this.cell.offsetWidth;
    this.startPos = YAHOO.util.Dom.getX(this.getDragEl());

    if(this.datatable.fixedWidth) {
        var cellLabel = YAHOO.util.Dom.getElementsByClassName(YAHOO.widget.DataTable.CLASS_LABEL,"span",this.cell)[0];
        this.minWidth = cellLabel.offsetWidth + 6;
        var sib = this.cell.nextSibling;
        var sibCellLabel = YAHOO.util.Dom.getElementsByClassName(YAHOO.widget.DataTable.CLASS_LABEL,"span",sib)[0];
        this.sibMinWidth = sibCellLabel.offsetWidth + 6;
//!!
        var left = ((this.startWidth - this.minWidth) < 0) ? 0 : (this.startWidth - this.minWidth);
        var right = ((sib.offsetWidth - this.sibMinWidth) < 0) ? 0 : (sib.offsetWidth - this.sibMinWidth);
        this.setXConstraint(left, right);
        YAHOO.log("cellstartwidth:" + this.startWidth,"time");
        YAHOO.log("cellminwidth:" + this.minWidth,"time");
        YAHOO.log("sibstartwidth:" + sib.offsetWidth,"time");
        YAHOO.log("sibminwidth:" + this.sibMinWidth,"time");
        YAHOO.log("l:" + left + " AND r:" + right,"time");
    }

};

/**
 * Handles mouseup events on the Column resizer.
 *
 * @method onMouseUp
 * @param e {string} The mouseup event
 */
YAHOO.util.ColumnResizer.prototype.onMouseUp = function(e) {
    //TODO: replace the resizer where it belongs:
    var resizeStyle = YAHOO.util.Dom.get(this.handleElId).style;
    resizeStyle.left = "auto";
    resizeStyle.right = 0;
    resizeStyle.marginRight = "-6px";
    resizeStyle.width = "6px";
    //.yui-dt-headresizer {position:absolute;margin-right:-6px;right:0;bottom:0;width:6px;height:100%;cursor:w-resize;cursor:col-resize;}


    //var cells = this.datatable._elTable.tHead.rows[this.datatable._elTable.tHead.rows.length-1].cells;
    //for(var i=0; i<cells.length; i++) {
        //cells[i].style.width = "5px";
    //}

    //TODO: set new ColumnSet width values
    this.datatable.fireEvent("columnResizeEvent", {column:this.column,target:this.cell});
};

/**
 * Handles drag events on the Column resizer.
 *
 * @method onDrag
 * @param e {string} The drag event
 */
YAHOO.util.ColumnResizer.prototype.onDrag = function(e) {
    var newPos = YAHOO.util.Dom.getX(this.getDragEl());
    //YAHOO.log("newpos:"+newPos,"warn");//YAHOO.util.Event.getPageX(e);
    var offsetX = newPos - this.startPos;
    //YAHOO.log("offset:"+offsetX,"warn");
    //YAHOO.log("startwidth:"+this.startWidth + " and offset:"+offsetX,"warn");
    var newWidth = this.startWidth + offsetX;
    //YAHOO.log("newwidth:"+newWidth,"warn");

    if(newWidth < this.minWidth) {
        newWidth = this.minWidth;
    }

    // Resize the Column
    var oDataTable = this.datatable;
    var elCell = this.cell;

    //YAHOO.log("newwidth" + newWidth,"warn");
    //YAHOO.log(newWidth + " AND "+ elColumn.offsetWidth + " AND " + elColumn.id,"warn");

    // Resize the other Columns
    if(oDataTable.fixedWidth) {
        // Moving right or left?
        var sib = elCell.nextSibling;
        //var sibIndex = elCell.index + 1;
        var sibnewwidth = sib.offsetWidth - offsetX;
        if(sibnewwidth < this.sibMinWidth) {
            sibnewwidth = this.sibMinWidth;
        }

        //TODO: how else to cycle through all the Columns without having to use an index property?
        for(var i=0; i<oDataTable._oColumnSet.length; i++) {
            if((i != elCell.index) &&  (i!=sibIndex)) {
                YAHOO.util.Dom.get(oDataTable._oColumnSet.keys[i].id).style.width = oDataTable._oColumnSet.keys[i].width + "px";
            }
        }
        sib.style.width = sibnewwidth;
        elCell.style.width = newWidth + "px";
        //oDataTable._oColumnSet.flat[sibIndex].width = sibnewwidth;
        //oDataTable._oColumnSet.flat[elCell.index].width = newWidth;

    }
    else {
        elCell.style.width = newWidth + "px";
    }
};



