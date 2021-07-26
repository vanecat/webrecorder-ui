
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
PywbSnapshot.prototype.getYearId = function() {
    return this.year;
}
PywbSnapshot.prototype.getMonthId = function() {
    return `${this.year}-${this.month}`;
}
PywbSnapshot.prototype.getDayId = function() {
    return `${this.year}-${this.month}-${this.day}`;
}
PywbSnapshot.prototype.getHourId = function() {
    return `${this.year}-${this.month}-${this.day}-${this.hour}`;
}

function PywbPeriod(init) {
    this.type = init.type;
    this.id = init.id;

    this.childrenIds = {}; // allow for query by ID
    this.children = []; // allow for sequentiality / order

    this.parent = init.parent;

    this.maxGrandchildSnapshotCount = 0;
    this.snapshotCount = 0;
    this.snapshots = [];

    this.lastScroll = init.lastScroll;
}
PywbPeriod.Type = {all: 0,year: 1,month: 2,day: 3,hour: 4};
PywbPeriod.TypeString = ['all','year','month','day','hour'];

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

PywbPeriod.prototype.addEmptySiblings = function(siblings) {
    const lastDateInMonth = (new Date((new Date(y, m, 1)).getTime() - 1000)).getDate(); // 1 sec earlier
    for (let d = 1; d <= lastDateInMonth; d++) {}
    const firstYear = yearsIds[0];
    const lastYear = yearsIds[yearsIds.length-1];
    for(let h=0; h<24; h++) {}
}
PywbPeriod.prototype.addSnapshot = function(snap, noCounting) {
    this.snapshots.push(snap);
    if (noCounting) {
        return; // used only for top-level period (all timeline)
    }

    this.snapshotCount++;
    let parent = this.parent;
    while (parent) {
        parent.snapshotCount++;
        if (parent.parent) { // grandparent
            parent.parent.maxGrandchildSnapshotCount = Math.max(parent.parent.maxGrandchildSnapshotCount, this.snapshotCount);
        }
        parent = parent.parent;
    }
};

PywbPeriod.prototype.getFullId = function() {
    switch (this.type) {
        case 'all': return 'all';
        case 'year': return this.year;
        case 'month': return `${this.year}-${this.month}`;
        case 'day': return `${this.year}-${this.month}-${this.day}`;
        case 'hour': return `${this.year}-${this.month}-${this.day}-${this.hour}`;
    }
}
PywbPeriod.prototype.getTypeText = function() {
    return PywbPeriod.TypeString[this.id];
}