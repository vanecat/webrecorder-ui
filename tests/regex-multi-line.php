<?php
$string = <<<EOSTR
<script>
    Pywb.vue.components['calendar-year'] = {
        template: '#calendar-year',
        props: ['period'],
        data: function() {
            return {};
        },
        computed: {
            year() {
                let year = null;
                if (this.period.type === PywbPeriod.Type.all) {
                    year = this.period.children[this.period.children.length-1];
                } else if (this.period.type === PywbPeriod.Type.year) {
                    year = this.period;
                } else {
                    year = this.period.getParents().filter(p => p.type === PywbPeriod.Type.year)[0];
                }
                if (year) {
                    year.fillEmptyChildPeriods(true);
                }
                return year;
            }
        }
    };
</script>
EOSTR;
$nl = '(:~:)';
$string = preg_replace('@[\n\r]@', $nl, $string);
preg_match("@<script>(.+?)</script>@", $string, $matches);

header('content-type: text/plain');
echo str_replace($nl, "\n", $matches[1]);
