const PywbMonthLabels = {1:'Jan', 2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'};

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
    return `${this.year}-${PywbMonthLabels[this.month]}-${this.day} ${this.getTimeFormatted()}`;
}
PywbSnapshot.prototype.getTimeFormatted = function() {
    return (this.hour < 13 ? this.hour : (this.hour % 12)) + ':' + ((this.minute < 10 ? '0':'')+this.minute) + ' ' + (this.hour < 12 ? 'am':'pm');
}

/* ---------------- PERIOD object ----------------- */
function PywbPeriod(init) {
    this.type = init.type;
    this.id = init.id;

    this.childrenIds = {}; // allow for query by ID
    this.children = []; // allow for sequentiality / order

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

PywbPeriod.prototype.parent = null;
PywbPeriod.prototype.addChild = function(period) {
    if (this.getChildById(period.id)) {
        return false;
    }
    period.parent = this;
    this.childrenIds[period.id] = this.children.length;
    this.children.push(period);
    return true;
};

PywbPeriod.prototype.fillEmptyPeriods = function() {
    let idRange = [];
    switch (this.type) {
        case PywbPeriod.Type.all:
            // year range: first to last year available
            idRange = [this.children[0].id, this.children[this.children.length-1].id]; break;
        case PywbPeriod.Type.year:
            // month is simple: 1 to 12
            idRange = [1,12]; break;
        case PywbPeriod.Type.month:
            // days in month: 1 to last day in month
            const y = this.parent.id; const m = this.id;
            const lastDateInMonth = (new Date((new Date(y, m, 1)).getTime() - 1000)).getDate(); // 1 sec earlier
            idRange = [1, lastDateInMonth]; break;
        case PywbPeriod.Type.day:
            // hours: 0 to 23
            idRange = [0,23]; break;
    }


    let i = 0;
    const childrenIds = Object.keys(this.childrenIds).map(i => parseInt(i));
    for (let newId = idRange[0]; newId <= idRange[1]; newId++) {

        if (i < childrenIds.length) {
            if (childrenIds[i] === newId) {
                // no change, skip, item already in place
                i++;
            } else {
                const empty = new PywbPeriod({type: this.type + 1, id: newId})
                if (newId < childrenIds[i]) {
                    // insert new before existing
                    this.children.splice(i, 0, empty);
                } else if (newId > childrenIds[i]) {
                    // insert new AFTER existing
                    this.children.splice(i + 1, 0, empty);
                    i++;
                }
            }
        } else {
            const empty = new PywbPeriod({type: this.type + 1, id: newId});
            this.children.push(empty);
        }
    }

    for(i=0;i<this.children.length;i++) {
        this.childrenIds[this.children[i].id] = i;
    }
}

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

PywbPeriod.prototype.getReadableId = function() {
    switch (this.type) {
        case PywbPeriod.Type.all:
            return 'All';
        case PywbPeriod.Type.year:
            return this.id;
        case PywbPeriod.Type.month:
            return PywbMonthLabels[this.id];
        case PywbPeriod.Type.day:
            return (this.id < 10 ? '0':'') + this.id;
        case PywbPeriod.Type.hour:
            return (this.id < 13 ? this.id : this.id % 12) + ' ' + (this.id < 12 ? 'am':'pm');
        case PywbPeriod.Type.snapshot:
            return this.snapshot.getTimeFormatted();
    }
}