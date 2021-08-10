if (!window.Pywb) window.Pywb = {};
Pywb.makeData = (rawSnaps) => {
    const allTimePeriod = new PywbPeriod({type: PywbPeriod.Type.all, id: 'all'});
    const snapshots = [];
    rawSnaps.forEach((rawSnap, i) => {
        const snap = new PywbSnapshot(rawSnap, i);
        let year, month, day, hour, single;
        if (!(year = allTimePeriod.getChildById(snap.year))) {
            year = new PywbPeriod({type: PywbPeriod.Type.year, id: snap.year});
            allTimePeriod.addChild(year);
        }
        if (!(month = year.getChildById(snap.month))) {
            month = new PywbPeriod({type: PywbPeriod.Type.month, id: snap.month});
            year.addChild(month);
        }
        if (!(day = month.getChildById(snap.day))) {
            day = new PywbPeriod({type: PywbPeriod.Type.day, id: snap.day});
            month.addChild(day);
        }
        if (!(hour = day.getChildById(snap.hour))) {
            hour = new PywbPeriod({type: PywbPeriod.Type.hour, id: snap.hour});
            day.addChild(hour);
        }
        if (!(single = hour.getChildById(snap.id))) {
            single = new PywbPeriod({type: PywbPeriod.Type.snapshot, id: snap.id});
            hour.addChild(single);
        }
        single.setSnapshot(snap);
        snapshots.push(snap);
    });

    return new PywbData(allTimePeriod, snapshots);
};
