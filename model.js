/* ---------------- SNAP SHOT object ----------------- */
function PywbSnapshot(init) {
    this.year = parseInt(init.timestamp.substr(0, 4));
    this.month = parseInt(init.timestamp.substr(4, 2));
    this.day = parseInt(init.timestamp.substr(6, 2));
    this.hour = parseInt(init.timestamp.substr(8, 2));
    this.minute = parseInt(init.timestamp.substr(10, 2));
    this.second = parseInt(init.timestamp.substr(12, 2));
    this.id = parseInt(init.timestamp);

    this.urlkey = init.urlkey;
    this.url = init.url;
    this.mime = init.mime;
    this.status = init.status;
    this.digest = init.digest;
    this.redirect = init.redirect;
    this.robotflags = init.robotflags;
    this.length = init.length;
    this.offset = init.offset;
    this.filename = init.filename;
    this.load_url = init.load_url;
    this['source-col'] = init['source-col'];
    this.access = init.access;
}

PywbSnapshot.prototype.getTimeDateFormatted = function() {
    return `${this.year}-${this.month}-${this.day} ${this.getTimeFormatted()}`;
}
PywbSnapshot.prototype.getTimeFormatted = function() {
    return (this.hour < 13 ? this.hour : (this.hour % 12)) + ':' + ((this.minute < 10 ? '0':'')+this.minute) + ' ' + (this.hour < 12 ? 'am':'pm');
}

/* ---------------- SNAP SHOT object ----------------- */
function PywbPeriod(init) {
    this.type = init.type;
    this.id = init.id;

    this.childrenIds = {}; // allow for query by ID
    this.children = []; // allow for sequentiality / order

    this.parent = init.parent;
    if (this.parent) {
        this.parent.addChild(this);
    }

    this.maxGrandchildSnapshotCount = 0;
    this.snapshotCount = 0;

    this.lastScroll = init.lastScroll;
}
PywbPeriod.Type = {all: 0,year: 1,month: 2,day: 3,hour: 4,snapshot:5};
PywbPeriod.TypeLabel = ['timeline','year','month','day','hour','snapshot'];

PywbPeriod.prototype.getTypeLabel = function() {
    return PywbPeriod.TypeLabel[this.type];
}
PywbPeriod.GetTypeLabel = function(type) {
    return PywbPeriod.TypeLabel[type] ? PywbPeriod.TypeLabel[type] : '';
}

PywbPeriod.prototype.getChildById = function(id) {
    return this.children[this.childrenIds[id]];
}
PywbPeriod.prototype.getPrevious = function() {
    if (!this.parent) {
        return null;
    }
    this.parent.getPreviousChild(this);
}
PywbPeriod.prototype.getPreviousChild = function(child) {
    const childIndex = this.childrenIds[child.id];
    if (childIndex <= 0) {
        return null;
    }
    return this.children[childIndex-1];
}
PywbPeriod.prototype.getNext = function() {
    if (!this.parent) {
        return null;
    }
    this.parent.getNextChild(this);
}
PywbPeriod.prototype.getNextChild = function(child) {
    const childIndex = this.childrenIds[child.id];
    if (childIndex >= this.children.length-1) {
        return null;
    }
    return this.children[childIndex+1];
}

PywbPeriod.prototype.addChild = function(period) {
    if (this.getChildById(period.id)) {
        return false;
    }
    this.childrenIds[period.id] = this.children.length;
    this.children.push(period);
    return true;
};

PywbPeriod.prototype.parents = null;
PywbPeriod.prototype.getParents = function() {
    if (!this.parents) {
        this.parents = [];
        let parent = this.parent;
        while(parent) {
            this.parents.push(parent);
            parent = parent.parent;
        }
        this.parents = this.parents.reverse();
    }
    return this.parents;
}
PywbPeriod.prototype.addEmptySiblings = function(siblings) {
    const lastDateInMonth = (new Date((new Date(y, m, 1)).getTime() - 1000)).getDate(); // 1 sec earlier
    for (let d = 1; d <= lastDateInMonth; d++) {}
    const firstYear = yearsIds[0];
    const lastYear = yearsIds[yearsIds.length-1];
    for(let h=0; h<24; h++) {}
}

PywbPeriod.prototype.snapshot = null;
PywbPeriod.prototype.setSnapshot = function(snap) {
    this.snapshot = snap;
    this.snapshotCount++;
    let parent = this.parent;
    let child = this;
    while (parent) {
        parent.snapshotCount++;

        let grandParent = parent.parent;
        if (grandParent) { // grandparent
            grandParent.maxGrandchildSnapshotCount = Math.max(grandParent.maxGrandchildSnapshotCount, child.snapshotCount);
        }
        child = parent;
        parent = parent.parent;
    }
};

PywbPeriod.monthLabels = {1:'Jan', 2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'};
PywbPeriod.prototype.getReadableId = function() {
    switch (this.type) {
        case PywbPeriod.Type.all:
            return 'All';
        case PywbPeriod.Type.year:
            return this.id;
        case PywbPeriod.Type.month:
            return PywbPeriod.monthLabels[this.id];
        case PywbPeriod.Type.day:
            return (this.id < 10 ? '0':'') + this.id;
        case PywbPeriod.Type.hour:
            return (this.id < 13 ? this.id : this.id % 12) + ' ' + (this.id < 12 ? 'am':'pm');
        case PywbPeriod.Type.snapshot:
            return this.snapshot.getTimeFormatted();
    }
}