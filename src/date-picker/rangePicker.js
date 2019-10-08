/**
 * @file Santd range picker createpicker file
 * @author mayihui@baidu.com
 **/
import san from 'san';
import RangeCalendar from '../calendar/src/rangeCalendar';
import moment from 'moment';
import {classCreator} from '../core/util';
import Trigger from '../core/trigger';
import Placements from '../calendar/src/placements';
import Icon from '../icon';
import Tag from '../tag';

const prefixCls = classCreator('calendar')();
const tagPrefixCls = classCreator('tag')();

function getShowDateFromValue(value, mode) {
    const [start, end] = value;
    // value could be an empty array, then we should not reset showDate
    if (!start && !end) {
        return;
    }
    if (mode && mode[0] === 'month') {
        return [start, end];
    }
    const newEnd = end && end.isSame(start, 'month') ? end.clone().add(1, 'month') : end;
    return [start, newEnd];
}

function isEmptyArray(arr) {
    if (Array.isArray(arr)) {
        return arr.length === 0 || arr.every(i => !i);
    }
    return false;
}

function pickerValueAdapter(value) {
    if (!value) {
        return;
    }
    if (Array.isArray(value)) {
        return value;
    }
    return [value, value.clone().add(1, 'month')];
}

export default san.defineComponent({
    computed: {
        /*renderFooter() {
            const renderExtraFooter = this.data.get('renderExtraFooter');
            const ranges = this.data.get('ranges');
            const prefixCls = this.data.get('prefixCls');
            const instance = this.data.get('instance');

            if (!renderExtraFooter && !ranges) {
                return null;
            }

            return san.defineComponent({
                computed: {
                    operations() {
                        const ranges = this.data.get('ranges');
                        return Object.keys(ranges || {});
                    }
                },
                initData() {
                    return {
                        ranges,
                        prefixCls,
                        tagPrefixCls,
                        renderExtraFooter
                    };
                },
                components: {
                    's-tag': Tag,
                    's-footer': renderExtraFooter && renderExtraFooter()
                },
                handleRangeClick(value) {
                    instance.handleRangeClick(value);
                },
                handleMouseEnter(value) {
                    instance.data.set('hoverValue', value);
                },
                handleMouseLeave() {
                    instance.handleRangeMouseLeave();
                },
                template: `<div>
                    <div
                        s-if="operations && operations.length"
                        class="{{prefixCls}}-footer-extra {{prefixCls}}-range-quick-selector"
                        key="range"
                    >
                        <s-tag
                            s-for="operation in operations"
                            key="{{operation}}"
                            prefixCls="{{tagPrefixCls}}"
                            color="blue"
                            on-click="handleRangeClick(ranges[operation])"
                            on-mouseenter="handleMouseEnter(ranges[operation])"
                            on-mouseleave="handleMouseLeave"
                        >
                            {{operation}}
                        </s-tag>
                    </div>
                    <div class="{{prefixCls}}-footer-extra" key="extra" s-if="{{renderExtraFooter}}">
                        <s-footer />
                    </div>
                </div>`
            });
        },*/
        displayStartValue() {
            const value = this.data.get('value');
            const format = this.data.get('format');
            return value && value[0] && value[0].format(format);
        },
        displayEndValue() {
            const value = this.data.get('value');
            const format = this.data.get('format');
            return value && value[1] && value[1].format(format);
        },
        calendarClasses() {
            let classArr = [];
            const showTime = this.data.get('showTime');
            const ranges = this.data.get('ranges');

            showTime && classArr.push(`${prefixCls}-time`);
            ranges && classArr.push(`${prefixCls}-range-with-ranges`);

            return classArr.join(' ');
        }
    },
    initData() {
        return {
            allowClear: true,
            showToday: false,
            separator: '~',
            hoverValue: [],
            disabledTime() {},
            trigger: 'click',
            placements: Placements

        };
    },
    inited() {
        this.data.set('instance', this);
        const value = this.data.get('value');
        const defaultValue = this.data.get('defaultValue');
        const pickerValue = !value || isEmptyArray(value) ? this.data.get('defaultPickerValue') : value;

        this.data.set('value', value || defaultValue || []);
        this.data.set('showDate', pickerValueAdapter(pickerValue || moment()));
    },
    handleOpenChange(open) {
        if (open === false) {
            this.data.set('hoverValue', []);
        }
        this.data.set('open', open);
        this.fire('openChange', open);
    },
    handleClearSelection(e) {
        e.preventDefault();
        e.stopPropagation();

        this.data.set('value', []);
        this.handleChange({selectedValue: []});
        this.dispatch('UI:form-item-interact', {fieldValue: '', type: 'change'});
    },
    handleChange(data) {
        const selectedValue = data.selectedValue;
        const cause = data.cause || {};

        this.data.set('value', selectedValue);
        this.data.set('selectedValue', selectedValue);
        this.data.set('showDate', getShowDateFromValue(selectedValue) || this.data.get('showDate'), {force: true});
        const format = this.data.get('format');
        const [start, end] = selectedValue;

        this.fire('change', {
            date: selectedValue,
            dateString: [start && start.format(format) || '', end && end.format(format) || '']
        });
        this.dispatch('UI:form-item-interact', {fieldValue: selectedValue, type: 'change'});

        if (cause.source === 'keyboard'
            || cause.source === 'dateInputSelect'
            || (!this.data.get('showTime') && cause.source !== 'dateInput')
            || cause.source === 'todayButton'
        ) {
            this.handleOpenChange(false);
        }
    },
    setValue(value, hidePanel) {
        this.handleChange(value);
        if ((hidePanel || !this.data.get('showTime'))) {
            this.data.set('open', false);
        }
    },
    handleRangeClick(value) {
        if (typeof value === 'function') {
            value = value();
        }

        this.setValue(value, true);

        this.fire('ok', value);
        this.fire('openChange', false);
    },
    handleRangeMouseLeave() {
        if (this.data.get('open')) {
            this.data.set('hoverValue', []);
        }
    },
    handleOk(value) {
        this.fire('ok', value);
    },
    handlePanelChange(params) {
        this.fire('panelChange', params);
    },
    components: {
        's-icon': Icon,
        's-trigger': Trigger,
        's-rangecalendar': RangeCalendar
    },
    template: `<span
            id="{{id}}"
            class="{{pickerClass}}"
            tabIndex="{{disabled ? -1 : 0}}"
        >

            <s-trigger
                prefixCls="${prefixCls}-picker-container"
                popupTransitionName="{{transitionName}}"
                dropdownClassName="{{dropdownClassName}}"
                getCalendarContainer="{{getCalendarContainer}}"
                visible="{{open}}"
                action="{{disabled ? [] : trigger}}"
                builtinPlacements="{{placements}}"
                popupPlacement="bottomLeft"
                on-visibleChange="handleOpenChange"
            >
                <s-rangecalendar
                    prefixCls="${prefixCls}"
                    slot="popup"
                    separator="{{separator}}"
                    format="{{format}}"
                    className="{{calendarClasses}}"
                    timePicker="{{timePicker}}"
                    disabledDate="{{disabledDate}}"
                    disabledTime="{{disabledTime}}"
                    dateInputPlaceholder="{{dateInputPlaceholder}}"
                    value="{{showDate}}"
                    selectedValue="{{selectedValue}}"
                    hoverValue="{{hoverValue}}"
                    showToday="{{showToday}}"
                    propMode="{{mode}}"
                    locale="{{locale.lang}}"
                    localeCode="{{localeCode}}"
                    on-select="handleChange"
                    on-panelChange="handlePanelChange"
                />
                <div class="{{pickerInputClass}}">
                    <input
                        disabled="{{disabled}}"
                        readOnly
                        value="{{displayStartValue}}"
                        placeholder="{{placeholder && placeholder[0] || locale.lang.rangePlaceholder[0]}}"
                        class="${prefixCls}-range-picker-input"
                        tabIndex="-1"
                        style="{{inputStyle}}"
                    />
                    <span class="${prefixCls}-range-picker-separator">{{separator}}</span>
                    <input
                        disabled="{{disabled}}"
                        readOnly
                        value="{{displayEndValue}}"
                        placeholder="{{placeholder && placeholder[1] || locale.lang.rangePlaceholder[1]}}"
                        class="${prefixCls}-range-picker-input"
                        tabIndex="-1"
                        style="{{inputStyle}}"
                    />
                    <s-icon
                        s-if="!disabled && allowClear && value && (value[0] || value[1])"
                        type="close-circle"
                        class="${prefixCls}-picker-clear"
                        theme="filled"
                        on-click="handleClearSelection"
                    />
                    <s-icon class="${prefixCls}-picker-icon" type="calendar" />
                </div>
            </s-trigger>
        </span>`
});
