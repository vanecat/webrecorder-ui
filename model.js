const PywbMonthLabels = {1:'Jan', 2:'Feb',3:'Mar',4:'Apr',5:'May',6:'Jun',7:'Jul',8:'Aug',9:'Sep',10:'Oct',11:'Nov',12:'Dec'};

function PywbData(timeline, snapshots) {
    this.timeline = timeline;
    this.snapshots = snapshots;
    this.getSnapshot = function(index) {
        if (index < 0 || index >= this.snapshots.length) {
            return null;
        }
        return this.snapshots[index];
    }
    this.getPreviousSnapshot = function(snapshot) {
        const index = snapshot.index;
        return this.getSnapshot(index-1);
    }
    this.getNextSnapshot = function(snapshot) {
        const index = snapshot.index;
        return this.getSnapshot(index+1);
    }
}
/* ---------------- SNAP SHOT object ----------------- */
function PywbSnapshot(init, index) {
    this.index = index;
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

// previous period (ONLY SET at the period level/type: snapshot)
PywbPeriod.prototype.previousSnapshotPeriod = null;
// next period (ONLY SET at the period level/type: snapshot)
PywbPeriod.prototype.nextSnapshotPeriod = null;

PywbPeriod.prototype.getFirstSnapshotPeriod = function(nonEmptyOnly=false) {
    return this.getFirstLastSnapshotPeriod_('first', nonEmptyOnly);
}
PywbPeriod.prototype.getLastSnapshotPeriod = function(nonEmptyOnly=false) {
    return this.getFirstLastSnapshotPeriod_('last', nonEmptyOnly);
}
PywbPeriod.prototype.getFirstLastSnapshotPeriod_ = function(direction, nonEmptyOnly=false) {
    let period = this;
    while (period.snapshotCount && period.type !== PywbPeriod.Type.snapshot) {
        let i = 0;
        if (nonEmptyOnly) {
            for(i; i < period.children.length; i++) {
                if (period.children[direction === 'first' ? i : (period.children.length - 1 - i)].snapshotCount) {
                    break;
                }
            }
        }
        period = period.children[direction === 'first' ? i : (period.children.length - 1 - i)];
    }
    if (period.type === PywbPeriod.Type.snapshot && period.snapshot) {
        return period;
    }
    return null;
}

PywbPeriod.prototype.getPrevious = function() {
    const firstSnapshotPeriod = this.getFirstSnapshotPeriod();
    if (!firstSnapshotPeriod) {
        return null;
    }
    const previousSnapshotPeriod = firstSnapshotPeriod.previousSnapshotPeriod;
    if (!previousSnapshotPeriod) {
        return null;
    }
    if (this.type === PywbPeriod.Type.snapshot) {
        return previousSnapshotPeriod;
    }
    let parent = previousSnapshotPeriod.parent;
    while(parent) {
        if (parent.type === this.type) {
            break;
        }
        parent = parent.parent;
    }
    return parent;
}
PywbPeriod.prototype.getNext = function() {
    const lastSnapshotPeriod = this.getLastSnapshotPeriod();
    if (!lastSnapshotPeriod) {
        return null;
    }
    const nextSnapshotPeriod = lastSnapshotPeriod.nextSnapshotPeriod;
    if (!nextSnapshotPeriod) {
        return null;
    }
    if (this.type === PywbPeriod.Type.snapshot) {
        return nextSnapshotPeriod;
    }
    let parent = nextSnapshotPeriod.parent;
    while(parent) {
        if (parent.type === this.type) {
            break;
        }
        parent = parent.parent;
    }
    return parent;
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

PywbPeriod.prototype.getChildrenRange = function() {
    switch (this.type) {
        case PywbPeriod.Type.all:
            // year range: first to last year available
            return [this.children[0].id, this.children[this.children.length-1].id];
        case PywbPeriod.Type.year:
            // month is simple: 1 to 12
            return [1,12];
        case PywbPeriod.Type.month:
            // days in month: 1 to last day in month
            const y = this.parent.id; const m = this.id;
            const lastDateInMonth = (new Date((new Date(y, m, 1)).getTime() - 1000)).getDate(); // 1 sec earlier
            return [1, lastDateInMonth];
        case PywbPeriod.Type.day:
            // hours: 0 to 23
            return [0,23];
    }
    return null;
}
PywbPeriod.prototype.fillEmptyChildPeriods = function(isFillEmptyGrandChildrenPeriods=false) {
    const idRange = this.getChildrenRange();
    if (!idRange) {
        return;
    }
    if (this.hasFilledEmptyChildPeriods) {
        return;
    }
    this.hasFilledEmptyChildPeriods = true;

    let i = 0;
    for (let newId = idRange[0]; newId <= idRange[1]; newId++) {

        if (i < this.children.length) {
            // if existing and new id match, skip, item already in place
            if (this.children[i].id === newId) {
                if (isFillEmptyGrandChildrenPeriods) {
                    this.children[i].fillEmptyChildPeriods();
                }
            }
            // else
            else if (this.children[i].id !== newId) {
                const empty = new PywbPeriod({type: this.type + 1, id: newId})
                if (newId < this.children[i].id) {
                    // insert new before existing
                    this.children.splice(i, 0, empty);
                } else {
                    // insert new after existing
                    this.children.splice(i+1, 0, empty);
                }
                empty.parent = this;
            }
            i++;
        } else {
            const empty = new PywbPeriod({type: this.type + 1, id: newId});
            this.children.push(empty);
            empty.parent = this;
        }
    }

    // re-calculate indexes
    for(let i=0;i<this.children.length;i++) {
        this.childrenIds[this.children[i].id] = i;
    }

    return idRange;
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

PywbPeriod.prototype.getFullReadableId = function(hasDayCardinalSuffix) {
    return this.getParents().map(p => p.getReadableId()).join(' ') + this.getReadableId();
}
PywbPeriod.prototype.getReadableId = function(hasDayCardinalSuffix) {
    switch (this.type) {
        case PywbPeriod.Type.all:
            return 'All';
        case PywbPeriod.Type.year:
            return this.id;
        case PywbPeriod.Type.month:
            return PywbMonthLabels[this.id];
        case PywbPeriod.Type.day:
            let suffix = '';
            if (hasDayCardinalSuffix) {
                const singleDigit = this.id % 10;
                const isTens = Math.floor(this.id / 10) === 1;
                const suffixes = {1:'st', 2:'nd',3:'rd'};
                suffix = (isTens || !suffixes[singleDigit]) ? 'th' : suffixes[singleDigit];
            }
            return this.id + suffix;
        case PywbPeriod.Type.hour:
            return (this.id < 13 ? this.id : this.id % 12) + ' ' + (this.id < 12 ? 'am':'pm');
        case PywbPeriod.Type.snapshot:
            return this.snapshot.getTimeFormatted();
    }
}