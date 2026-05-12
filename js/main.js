        const palaces = ["大安", "留连", "速喜", "赤口", "小吉", "空亡"];
        const zhiOrder = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        const palaceWuxingMap = ["木", "水", "火", "金", "木", "土"];
        const zhiWuxingMap = {
            "寅": "木", "卯": "木",
            "巳": "火", "午": "火",
            "丑": "土", "辰": "土", "未": "土", "戌": "土",
            "申": "金", "酉": "金",
            "亥": "水", "子": "水"
        };
        const wuxingShengMap = { "木": "火", "火": "土", "土": "金", "金": "水", "水": "木" };
        const wuxingKeMap = { "金": "木", "木": "土", "土": "水", "水": "火", "火": "金" };
        const wuXingBadgeColorMap = {
            "木星": "#2e7d32",
            "火星": "#c62828",
            "土星": "#7a5230",
            "金星": "#b8860b",
            "水星": "#1565c0",
            "天空": "#000000"
        };
        const liuShenBadgeColorMap = {
            "青龙": "#2e7d32",
            "朱雀": "#c62828",
            "勾陈": "#7a5230",
            "白虎": "#b8860b",
            "腾蛇": "#7a5230",
            "玄武": "#1565c0"
        };
        const wuxingColorMap = {
            "甲": "#2e7d32", "乙": "#2e7d32", "寅": "#2e7d32", "卯": "#2e7d32",
            "丙": "#c62828", "丁": "#c62828", "巳": "#c62828", "午": "#c62828",
            "戊": "#7a5230", "己": "#7a5230", "丑": "#7a5230", "辰": "#7a5230", "未": "#7a5230", "戌": "#7a5230",
            "庚": "#b8860b", "辛": "#b8860b", "申": "#b8860b", "酉": "#b8860b",
            "壬": "#1565c0", "癸": "#1565c0", "亥": "#1565c0", "子": "#1565c0"
        };
        const wuxingElementColorMap = {
            "木": "#2e7d32",
            "火": "#c62828",
            "土": "#7a5230",
            "金": "#b8860b",
            "水": "#1565c0"
        };
        const REFERENCE_HELP_DOC_PATH = 'docs/explanation.json';
        const REFERENCE_SLOT_CATEGORY_MAP = {
            "slot-wuxing": "wuxing",
            "slot-liushen": "liushen",
            "slot-liuqin": "liuqin",
            "slot-palace-name": "palace"
        };
        const REFERENCE_CATEGORY_KEY_MAP = {
            palace: "palace",
            palaces: "palace",
            wuxing: "wuxing",
            wuxing_stars: "wuxing",
            liushen: "liushen",
            liu_shen: "liushen",
            liuqin: "liuqin",
            liu_qin: "liuqin"
        };
        const REFERENCE_ITEM_FIELD_LABELS = {
            number: "数字",
            element: "五行",
            orientation: "吉凶",
            meaning: "主意",
            timing: "应期",
            character: "人物",
            location: "方位地点",
            imagery: "类象",
            disease: "病象",
            relation: "关系",
            function: "功能",
            objects: "对应对象",
            focus: "核心关注",
            positive: "正向",
            negative: "负向",
            style: "风格",
            energy: "阶段",
            industry: "行业",
            key_factor: "关键点",
            direction: "方向",
            color: "颜色",
            weather: "天气",
            position: "位置",
            occupation: "职业",
            type: "属性"
        };
        const DEFAULT_REFERENCE_BADGE_LABEL_SET = new Set(Object.values(REFERENCE_ITEM_FIELD_LABELS));
        let referenceBadgeLabelSet = new Set(DEFAULT_REFERENCE_BADGE_LABEL_SET);
        const EMPTY_REFERENCE_HELP_DOC = {
            categories: {},
            rules: {
                liuqinInteraction: { sheng: {}, ke: {} }
            }
        };
        let referenceHelpDocCache = null;
        let referenceHelpDocPromise = null;
        function extractReferenceCategorySegment(rawCategoryKey) {
            if (typeof rawCategoryKey !== 'string') return '';
            const normalized = rawCategoryKey.trim();
            if (!normalized) return '';
            const numberedKeyMatch = normalized.match(/^\d+_(.+)$/);
            return numberedKeyMatch ? numberedKeyMatch[1] : normalized;
        }
        function normalizeReferenceCategoryKey(rawCategoryKey) {
            const keySegment = extractReferenceCategorySegment(rawCategoryKey);
            return REFERENCE_CATEGORY_KEY_MAP[keySegment] || '';
        }
        function buildReferenceBadgeLabelSet(rawLabels) {
            const dynamicBadgeSet = new Set(DEFAULT_REFERENCE_BADGE_LABEL_SET);
            if (rawLabels && typeof rawLabels === 'object') {
                Object.entries(REFERENCE_ITEM_FIELD_LABELS).forEach(([fieldKey, defaultLabel]) => {
                    const labelValue = rawLabels[fieldKey];
                    if (typeof labelValue === 'string' && labelValue.trim()) {
                        dynamicBadgeSet.add(labelValue.trim());
                    } else {
                        dynamicBadgeSet.add(defaultLabel);
                    }
                });
            }
            return dynamicBadgeSet;
        }
        function normalizeReferenceInteractionMap(rawMap) {
            const safeMap = {};
            if (!rawMap || typeof rawMap !== 'object') return safeMap;
            Object.entries(rawMap).forEach(([sourceLabel, targetLabel]) => {
                const source = String(sourceLabel || '').trim();
                const target = String(targetLabel || '').trim();
                if (!source || !target) return;
                safeMap[source] = target;
            });
            return safeMap;
        }
        function normalizeReferenceRules(rawRules) {
            const liuqinRaw = rawRules?.liuqin_interaction || rawRules?.liuqinInteraction || {};
            return {
                liuqinInteraction: {
                    sheng: normalizeReferenceInteractionMap(liuqinRaw.sheng),
                    ke: normalizeReferenceInteractionMap(liuqinRaw.ke)
                }
            };
        }
        function normalizeReferenceItemDescription(rawItemValue) {
            if (typeof rawItemValue === 'string') {
                return rawItemValue.trim();
            }
            if (!rawItemValue || typeof rawItemValue !== 'object') return '';
            const sections = [];
            if (typeof rawItemValue.desc === 'string' && rawItemValue.desc.trim()) {
                sections.push(rawItemValue.desc.trim());
            } else if (typeof rawItemValue.description === 'string' && rawItemValue.description.trim()) {
                sections.push(rawItemValue.description.trim());
            }
            Object.entries(REFERENCE_ITEM_FIELD_LABELS).forEach(([fieldKey, fieldLabel]) => {
                const fieldValue = rawItemValue[fieldKey];
                if (typeof fieldValue === 'undefined' || fieldValue === null || fieldValue === '') return;
                const normalizedValue = Array.isArray(fieldValue) ? fieldValue.join('、') : String(fieldValue);
                sections.push(`${fieldLabel}：${normalizedValue}`);
            });
            return sections.join('\n');
        }
        function collectReferenceItemAliases(itemKey, itemValue) {
            const aliasSet = new Set();
            if (typeof itemKey === 'string' && itemKey.trim()) {
                aliasSet.add(itemKey.trim());
            }
            if (itemValue && typeof itemValue === 'object') {
                if (typeof itemValue.name === 'string' && itemValue.name.trim()) {
                    aliasSet.add(itemValue.name.trim());
                }
                if (typeof itemValue.element === 'string' && itemValue.element.trim()) {
                    itemValue.element.split('/').map((part) => part.trim()).filter(Boolean).forEach((part) => {
                        aliasSet.add(part);
                    });
                }
            }
            return Array.from(aliasSet);
        }
        function normalizeReferenceHelpDoc(rawDoc) {
            const categories = {};
            const sourceCategories = rawDoc && typeof rawDoc === 'object'
                ? (rawDoc.categories && typeof rawDoc.categories === 'object'
                    ? rawDoc.categories
                    : (rawDoc.data && typeof rawDoc.data === 'object' ? rawDoc.data : null))
                : null;
            referenceBadgeLabelSet = buildReferenceBadgeLabelSet(rawDoc?.labels);
            if (sourceCategories) {
                Object.entries(sourceCategories).forEach(([categoryKey, categoryValue]) => {
                    if (!categoryValue || typeof categoryValue !== 'object') return;
                    const normalizedCategoryKey = normalizeReferenceCategoryKey(categoryKey);
                    if (!normalizedCategoryKey) return;
                    const label = typeof categoryValue.label === 'string' ? categoryValue.label : '';
                    const safeItems = {};
                    if (categoryValue.items && typeof categoryValue.items === 'object') {
                        Object.entries(categoryValue.items).forEach(([itemKey, itemValue]) => {
                            const description = normalizeReferenceItemDescription(itemValue);
                            if (!description) return;
                            collectReferenceItemAliases(itemKey, itemValue).forEach((alias) => {
                                safeItems[alias] = description;
                            });
                        });
                    }
                    categories[normalizedCategoryKey] = { label, items: safeItems };
                });
            }
            return {
                categories,
                rules: normalizeReferenceRules(rawDoc?.rules)
            };
        }
        async function loadReferenceHelpDoc() {
            if (referenceHelpDocCache) return referenceHelpDocCache;
            if (referenceHelpDocPromise) return referenceHelpDocPromise;
            referenceHelpDocPromise = fetch(REFERENCE_HELP_DOC_PATH, { cache: 'no-store' })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`读取解释文档失败: HTTP ${response.status}`);
                    }
                    return response.json();
                })
                .then((rawDoc) => {
                    referenceHelpDocCache = normalizeReferenceHelpDoc(rawDoc);
                    return referenceHelpDocCache;
                })
                .catch((error) => {
                    console.warn('加载术语解释文档失败:', error);
                    referenceHelpDocCache = EMPTY_REFERENCE_HELP_DOC;
                    return referenceHelpDocCache;
                })
                .finally(() => {
                    referenceHelpDocPromise = null;
                });
            return referenceHelpDocPromise;
        }
        function parseReferenceHelpDescription(rawDescription) {
            const description = String(rawDescription || '').trim();
            if (!description) return [];
            return description.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => {
                const match = line.match(/^([^：:]{1,20})[：:]\s*(.*)$/);
                if (!match) {
                    return { text: line };
                }
                const badgeLabel = String(match[1] || '').trim();
                const badgeContent = String(match[2] || '').trim();
                if (!referenceBadgeLabelSet.has(badgeLabel)) {
                    return { text: line };
                }
                return {
                    badge: badgeLabel,
                    content: badgeContent
                };
            });
        }
        function getInteractionIncomingLabel(targetLabel, interactionMap) {
            if (!targetLabel || !interactionMap || typeof interactionMap !== 'object') return '';
            const hit = Object.entries(interactionMap).find(([, target]) => target === targetLabel);
            return hit ? String(hit[0] || '').trim() : '';
        }
        function createLiuqinFlowItem(label, toneClassName, areaClassName) {
            const itemEl = document.createElement('div');
            itemEl.className = `reference-liuqin-flow-item ${toneClassName} ${areaClassName}`;
            itemEl.textContent = label || '—';
            return itemEl;
        }
        function createLiuqinFlowArrow(toneClassName, areaClassName) {
            const arrowEl = document.createElement('div');
            arrowEl.className = `reference-liuqin-flow-arrow ${toneClassName} ${areaClassName}`;
            arrowEl.setAttribute('aria-hidden', 'true');
            return arrowEl;
        }
        function renderLiuqinInteractionDiagram({ label, referenceHelpDoc }) {
            if (!referenceHelpContent || !label || !referenceHelpDoc) return;
            const shengMap = referenceHelpDoc.rules?.liuqinInteraction?.sheng || {};
            const keMap = referenceHelpDoc.rules?.liuqinInteraction?.ke || {};
            const incomingSheng = getInteractionIncomingLabel(label, shengMap);
            const outgoingSheng = String(shengMap[label] || '').trim();
            const incomingKe = getInteractionIncomingLabel(label, keMap);
            const outgoingKe = String(keMap[label] || '').trim();
            if (!incomingSheng && !outgoingSheng && !incomingKe && !outgoingKe) return;

            const sectionEl = document.createElement('section');
            sectionEl.className = 'reference-liuqin-flow-section';

            const titleEl = document.createElement('h3');
            titleEl.className = 'reference-liuqin-flow-title';
            titleEl.textContent = '六亲生克逻辑';
            sectionEl.appendChild(titleEl);

            const chartEl = document.createElement('div');
            chartEl.className = 'reference-liuqin-flow-chart';

            chartEl.appendChild(createLiuqinFlowItem(incomingSheng, 'is-sheng', 'area-incoming-sheng'));
            chartEl.appendChild(createLiuqinFlowArrow('is-sheng', 'area-arrow-left-sheng'));
            chartEl.appendChild(createLiuqinFlowItem(label, 'is-center', 'area-center'));
            chartEl.appendChild(createLiuqinFlowArrow('is-sheng', 'area-arrow-right-sheng'));
            chartEl.appendChild(createLiuqinFlowItem(outgoingSheng, 'is-sheng', 'area-outgoing-sheng'));

            chartEl.appendChild(createLiuqinFlowItem(incomingKe, 'is-ke', 'area-incoming-ke'));
            chartEl.appendChild(createLiuqinFlowArrow('is-ke', 'area-arrow-left-ke'));
            chartEl.appendChild(createLiuqinFlowArrow('is-ke', 'area-arrow-right-ke'));
            chartEl.appendChild(createLiuqinFlowItem(outgoingKe, 'is-ke', 'area-outgoing-ke'));

            sectionEl.appendChild(chartEl);
            referenceHelpContent.appendChild(sectionEl);
        }
        function renderReferenceHelpContent(rawDescription, options = {}) {
            if (!referenceHelpContent) return;
            const parsedLines = parseReferenceHelpDescription(rawDescription);
            referenceHelpContent.textContent = '';
            if (parsedLines.length) {
            const fragment = document.createDocumentFragment();
            parsedLines.forEach((line) => {
                if (line.badge) {
                    const entryEl = document.createElement('div');
                    entryEl.className = 'reference-help-entry';
                    const badgeEl = document.createElement('span');
                    badgeEl.className = 'reference-help-badge';
                    badgeEl.textContent = line.badge;
                    const valueEl = document.createElement('span');
                    valueEl.className = 'reference-help-entry-value';
                    valueEl.textContent = line.content || '';
                    entryEl.appendChild(badgeEl);
                    entryEl.appendChild(valueEl);
                    fragment.appendChild(entryEl);
                    return;
                }
                const paragraphEl = document.createElement('p');
                paragraphEl.className = 'reference-help-paragraph';
                paragraphEl.textContent = line.text || '';
                fragment.appendChild(paragraphEl);
            });
            referenceHelpContent.appendChild(fragment);
            }
            if (options.categoryKey === 'liuqin') {
                renderLiuqinInteractionDiagram({
                    label: options.label,
                    referenceHelpDoc: options.referenceHelpDoc
                });
            }
        }
        function colorizeGanZhiText(text) {
            return Array.from(text).map((ch) => {
                const color = wuxingColorMap[ch];
                if (!color) return ch;
                return `<span style="color: ${color} !important;">${ch}</span>`;
            }).join('');
        }

        function updateClock() {
            const now = new Date();

            const solarStr = now.getFullYear() + '年' + 
                (now.getMonth() + 1) + '月' + 
                now.getDate() + '日 ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0');
            document.getElementById('solarClock').innerText = solarStr;

            const lunar = Lunar.fromDate(now);
            const lunarStr = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            document.getElementById('lunarClock').innerHTML = colorizeGanZhiText(lunarStr);
        }

        function initGrid() {
            const grid = document.getElementById('palaceGrid');
            const displayOrder = [1, 2, 3, 0, 5, 4];
            grid.innerHTML = displayOrder.map((palaceIndex) => {
                const palaceName = palaces[palaceIndex];
                const palaceWuxing = palaceWuxingMap[palaceIndex];
                const underlineColor = wuxingElementColorMap[palaceWuxing] || "#4b3521";
                return `
                <div id="palace-${palaceIndex}" class="palace-card">
                    <span class="palace-slot slot-wuxing"></span>
                    <span class="palace-slot slot-liushen"></span>
                    <span class="palace-slot slot-zhi"></span>
                    <span class="palace-slot slot-liuqin"></span>
                    <span class="palace-slot slot-daytime"></span>
                    <span class="palace-slot slot-body"></span>
                    <span class="palace-slot slot-palace-name" style="--palace-underline-color: ${underlineColor};">${palaceName}</span>
                </div>
            `;
            }).join('');
        }

        function setPalaceNameUnderlineVisible(visible) {
            document.querySelectorAll('.slot-palace-name').forEach((el) => {
                el.classList.toggle('show-underline', visible);
            });
        }

        function getShiChenCount(timeZhi) {
            const zhiIndex = zhiOrder.indexOf(timeZhi);
            return zhiIndex === -1 ? 1 : zhiIndex + 1;
        }

        function toDateTimeLocalValue(date) {
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        function formatManualDateTimeValue(date) {
            return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        }

        const dateTimeSegments = [
            { key: 'year', start: 0, end: 4, len: 4 },
            { key: 'month', start: 5, end: 7, len: 2 },
            { key: 'day', start: 8, end: 10, len: 2 },
            { key: 'hour', start: 11, end: 13, len: 2 },
            { key: 'minute', start: 14, end: 16, len: 2 }
        ];
        let activeSegmentIndex = 0;
        let segmentInputBuffer = '';
        let segmentPreviousValue = '';
        let chineseDatePicker = null;
        let isPointerFocusingManualInput = false;
        let detachCalendarAutoPosition = null;
        let hasInitializedNotesPanel = false;

        function getSegmentIndexByPosition(pos) {
            if (pos <= 4) return 0;
            if (pos <= 7) return 1;
            if (pos <= 10) return 2;
            if (pos <= 13) return 3;
            return 4;
        }

        function selectDateTimeSegment(input, segmentIndex) {
            const safeIndex = Math.max(0, Math.min(dateTimeSegments.length - 1, segmentIndex));
            const segment = dateTimeSegments[safeIndex];
            activeSegmentIndex = safeIndex;
            segmentInputBuffer = '';
            const parts = getSegmentValuesFromInput(input.value);
            segmentPreviousValue = parts[segment.key] || '';
            input.setSelectionRange(segment.start, segment.end);
        }

        function getSegmentValuesFromInput(value) {
            const strictMatch = String(value || '').match(/^(\d{4})\/(\d{2})\/(\d{2})\s(\d{2}):(\d{2})$/);
            if (strictMatch) {
                return {
                    year: strictMatch[1],
                    month: strictMatch[2],
                    day: strictMatch[3],
                    hour: strictMatch[4],
                    minute: strictMatch[5]
                };
            }
            const fallbackDate = parseDateTimeValue(value) || new Date();
            return {
                year: String(fallbackDate.getFullYear()).padStart(4, '0'),
                month: String(fallbackDate.getMonth() + 1).padStart(2, '0'),
                day: String(fallbackDate.getDate()).padStart(2, '0'),
                hour: String(fallbackDate.getHours()).padStart(2, '0'),
                minute: String(fallbackDate.getMinutes()).padStart(2, '0')
            };
        }

        function buildDateTimeTextFromParts(parts) {
            return `${parts.year}/${parts.month}/${parts.day} ${parts.hour}:${parts.minute}`;
        }

        function getDaysInMonth(year, month) {
            return new Date(year, month, 0).getDate();
        }

        function isSegmentValueValid(segmentKey, candidate, parts) {
            const numeric = Number(candidate);
            if (!Number.isFinite(numeric)) return false;
            if (segmentKey === 'year') return numeric >= 1 && numeric <= new Date().getFullYear();
            if (segmentKey === 'month') return numeric >= 1 && numeric <= 12;
            if (segmentKey === 'hour') return numeric >= 0 && numeric <= 23;
            if (segmentKey === 'minute') return numeric >= 0 && numeric <= 59;
            if (segmentKey === 'day') {
                const year = Number(parts.year);
                const month = Number(parts.month);
                if (month < 1 || month > 12 || year < 1 || year > new Date().getFullYear()) return false;
                return numeric >= 1 && numeric <= getDaysInMonth(year, month);
            }
            return false;
        }

        function parseStrictManualDateTimeValue(value) {
            if (!value) return null;
            const raw = String(value).trim();
            const slashMatch = raw.match(/^(\d{4})\/(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/);
            if (!slashMatch) return null;
            const [, yStr, mStr, dStr, hStr, minStr] = slashMatch;
            const year = Number(yStr);
            const month = Number(mStr);
            const day = Number(dStr);
            const hour = Number(hStr);
            const minute = Number(minStr);
            if (year > new Date().getFullYear()) return null;
            if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return null;
            const date = new Date(year, month - 1, day, hour, minute, 0, 0);
            if (
                date.getFullYear() !== year ||
                date.getMonth() !== month - 1 ||
                date.getDate() !== day ||
                date.getHours() !== hour ||
                date.getMinutes() !== minute
            ) {
                return null;
            }
            return date;
        }

        function parseDateTimeValue(value) {
            if (!value) return null;
            const strictManualDate = parseStrictManualDateTimeValue(value);
            if (strictManualDate) return strictManualDate;
            const raw = String(value).trim();
            const normalized = raw.includes('T') ? raw : raw.replace(' ', 'T');
            const date = new Date(normalized);
            return Number.isNaN(date.getTime()) ? null : date;
        }

        function validateManualDateTimeInput(rawValue, { report = false } = {}) {
            const manualInput = document.getElementById('dateTimeManualInput');
            const date = parseStrictManualDateTimeValue(rawValue);
            if (date) {
                manualInput.setCustomValidity('');
                return date;
            }
            manualInput.setCustomValidity('请输入有效时间，格式为 yyyy/mm/dd HH:mm');
            if (report) manualInput.reportValidity();
            return null;
        }

        function updateSelectedDateLunarInfo(date) {
            const lunarInfoEl = document.getElementById('selectedDateLunarInfo');
            if (!lunarInfoEl) return;
            if (!date) {
                lunarInfoEl.innerText = '';
                return;
            }
            const lunar = Lunar.fromDate(date);
            const lunarText = `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            lunarInfoEl.innerHTML = colorizeGanZhiText(lunarText);
        }

        function positionCalendarCenteredBelowDateTimeRow(instance) {
            if (!instance || !instance.calendarContainer) return;
            const anchorEl =
                document.querySelector('.datetime-picker-wrap') ||
                document.querySelector('.datetime-row');
            if (!anchorEl) return;
            const calendarEl = instance.calendarContainer;
            const anchorRect = anchorEl.getBoundingClientRect();
            const calendarRect = calendarEl.getBoundingClientRect();
            const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
            const sidePadding = Math.max(8, Math.floor(viewportWidth * 0.03));
            const centeredLeft = anchorRect.left + (anchorRect.width - calendarRect.width) / 2;
            const maxLeft = Math.max(sidePadding, viewportWidth - calendarRect.width - sidePadding);
            const horizontalLeft = Math.min(Math.max(sidePadding, centeredLeft), maxLeft);
            const rootFontSize = parseFloat(window.getComputedStyle(document.documentElement).fontSize) || 16;
            const verticalGap = rootFontSize * 0.5;
            const verticalTop = anchorRect.bottom + (window.scrollY || window.pageYOffset || 0) + verticalGap;

            calendarEl.style.position = 'absolute';
            calendarEl.style.left = `${horizontalLeft + (window.scrollX || window.pageXOffset || 0)}px`;
            calendarEl.style.top = `${verticalTop}px`;
            calendarEl.style.right = 'auto';
        }

        function attachCalendarAutoPosition(instance) {
            if (!instance || detachCalendarAutoPosition) return;
            const syncPosition = () => {
                if (!instance.isOpen) return;
                positionCalendarCenteredBelowDateTimeRow(instance);
            };
            const onResize = () => {
                if (typeof instance.redraw === 'function') {
                    instance.redraw();
                }
                syncPosition();
            };
            const onScroll = () => syncPosition();
            window.addEventListener('resize', onResize);
            window.addEventListener('scroll', onScroll, true);
            detachCalendarAutoPosition = () => {
                window.removeEventListener('resize', onResize);
                window.removeEventListener('scroll', onScroll, true);
                detachCalendarAutoPosition = null;
            };
        }

        function detachCalendarPositionListeners() {
            if (detachCalendarAutoPosition) {
                detachCalendarAutoPosition();
            }
        }

        function setDateTimeValue(value) {
            const dateTimeInput = document.getElementById('dateTime');
            const manualInput = document.getElementById('dateTimeManualInput');
            const date = parseDateTimeValue(value);
            const normalizedValue = date ? toDateTimeLocalValue(date) : '';
            const previousValue = dateTimeInput.value;
            const hasDateTimeChanged = previousValue !== normalizedValue;
            if (hasDateTimeChanged) {
                if (previousValue) {
                    clearCurrentCalculationResult();
                }
                if (hasInitializedNotesPanel) {
                    clearCurrentPageNotesContent({ preserveQuestionFields: true });
                }
            }
            dateTimeInput.value = normalizedValue;
            if (manualInput) manualInput.value = date ? formatManualDateTimeValue(date) : '';
            if (chineseDatePicker && date) {
                chineseDatePicker.setDate(date, false);
            }
            updateSelectedDateLunarInfo(date);
        }

        function clearCurrentCalculationResult() {
            clearPalaceLayoutTexts();
            setPalaceNameUnderlineVisible(false);
            refreshAllNotePalacePreviews();
        }

        function ensureDefaultCurrentDateTime() {
            const current = document.getElementById('dateTime').value;
            if (current && parseDateTimeValue(current)) return;
            setDateTimeValue(toDateTimeLocalValue(new Date()));
        }

        function resetCurrentBoardToDefaults() {
            const methodInput = document.getElementById('method');
            const currentMethodValue = String(methodInput?.value || '').trim();
            const shouldPreserveNumSection = currentMethodValue === '数字起卦';
            if (methodInput && MAIN_PANEL_METHOD_OPTIONS.length) {
                if (!shouldPreserveNumSection) {
                    methodInput.value = MAIN_PANEL_METHOD_OPTIONS[0].value;
                    methodInput.dispatchEvent(new Event('change', { bubbles: true }));
                } else {
                    // Keep the current divination method so the num section remains visible after reset.
                    methodInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            setDateTimeValue(toDateTimeLocalValue(new Date()));
            const numInput = document.getElementById('numInput');
            if (numInput instanceof HTMLInputElement) {
                numInput.value = '';
            }
            clearCurrentCalculationResult();
            clearCurrentPageNotesContent({ preserveQuestionFields: false });
        }

        function applyManualInputDateTime(rawValue) {
            const date = validateManualDateTimeInput(rawValue);
            if (!date) {
                const hiddenValue = document.getElementById('dateTime').value;
                const fallbackDate = parseDateTimeValue(hiddenValue);
                if (fallbackDate) {
                    document.getElementById('dateTimeManualInput').value = formatManualDateTimeValue(fallbackDate);
                }
                return;
            }
            setDateTimeValue(toDateTimeLocalValue(date));
        }

        function setPalaceText(index, selector, text) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const slot = el.querySelector(selector);
            if (!slot) return;
            slot.innerText = text || '';
        }

        function setCircledPalaceText(index, selector, texts) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const slot = el.querySelector(selector);
            if (!slot) return;
            if (!texts || !texts.length) {
                slot.innerHTML = '';
                return;
            }
            slot.innerHTML = texts.map((text) => `<span class="circled-char">${text}</span>`).join('');
        }

        function setZhiLabel(index, zhi) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const color = wuxingColorMap[zhi] || '#4b3521';
            const slot = el.querySelector('.slot-zhi');
            if (!slot) return;
            slot.innerHTML = zhi ? `<span style="color: ${color} !important;">${zhi}</span>` : '';
        }

        function setLiuQinLabel(index, liuQin) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const slot = el.querySelector('.slot-liuqin');
            if (!slot) return;
            setBadgeLabel(slot, liuQin);
        }

        function setLiuShenLabel(index, liuShen) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const slot = el.querySelector('.slot-liushen');
            if (!slot) return;
            const badgeColor = liuShenBadgeColorMap[liuShen] || '#4b3521';
            setBadgeLabel(slot, liuShen, {
                borderColor: badgeColor,
                backgroundColor: badgeColor,
            });
        }

        function setWuXingLabel(index, wuXing) {
            const el = document.getElementById(`palace-${index}`);
            if (!el) return;
            const slot = el.querySelector('.slot-wuxing');
            if (!slot) return;
            const badgeColor = wuXingBadgeColorMap[wuXing] || '#4b3521';
            setBadgeLabel(slot, wuXing, {
                borderColor: badgeColor,
                textColor: badgeColor,
            });
        }

        const BADGE_CSS_VARS = ['--badge-border-color', '--badge-bg-color', '--badge-text-color'];

        function clearBadgeSlotVars(slot) {
            BADGE_CSS_VARS.forEach((prop) => slot.style.removeProperty(prop));
        }

        function setBadgeLabel(slot, text, styles = {}) {
            if (!slot) return;
            if (!text) {
                slot.textContent = '';
                clearBadgeSlotVars(slot);
                return;
            }
            slot.textContent = text;
            if (styles.borderColor) slot.style.setProperty('--badge-border-color', styles.borderColor);
            else slot.style.removeProperty('--badge-border-color');
            if (styles.backgroundColor) slot.style.setProperty('--badge-bg-color', styles.backgroundColor);
            else slot.style.removeProperty('--badge-bg-color');
            if (styles.textColor) slot.style.setProperty('--badge-text-color', styles.textColor);
            else slot.style.removeProperty('--badge-text-color');
        }

        function clearPalaceLayoutTexts() {
            for (let i = 0; i < 6; i++) {
                setPalaceText(i, '.slot-daytime', '');
                setPalaceText(i, '.slot-body', '');
                setPalaceText(i, '.slot-zhi', '');
                setLiuQinLabel(i, '');
                setLiuShenLabel(i, '');
                setWuXingLabel(i, '');
            }
        }

        function setDayLabel(dayIndex) {
            setCircledPalaceText(dayIndex, '.slot-daytime', ['日']);
        }

        function setNumberLabel(numberIndex) {
            setCircledPalaceText(numberIndex, '.slot-daytime', ['数']);
        }

        function setTimeAndBodyLabel(dayIndex, bodyIndex) {
            if (bodyIndex === dayIndex) {
                setCircledPalaceText(dayIndex, '.slot-daytime', ['日', '时']);
            } else {
                setCircledPalaceText(bodyIndex, '.slot-daytime', ['时']);
            }
            setCircledPalaceText(bodyIndex, '.slot-body', ['身']);
        }

        function setNumberTimeAndBodyLabel(numberIndex, bodyIndex) {
            if (bodyIndex === numberIndex) {
                setCircledPalaceText(numberIndex, '.slot-daytime', ['数', '时']);
            } else {
                setNumberLabel(numberIndex);
                setCircledPalaceText(bodyIndex, '.slot-daytime', ['时']);
            }
            setCircledPalaceText(bodyIndex, '.slot-body', ['身']);
        }

        function getNumberPalaceCount(num) {
            const remainder = num % 6;
            return remainder === 0 ? 6 : remainder;
        }

        function getLiuQinByWuxing(selfWuxing, targetWuxing) {
            if (!selfWuxing || !targetWuxing) return '';
            if (selfWuxing === targetWuxing) return '兄弟';
            if (wuxingShengMap[targetWuxing] === selfWuxing) return '父母';
            if (wuxingShengMap[selfWuxing] === targetWuxing) return '子孙';
            if (wuxingKeMap[selfWuxing] === targetWuxing) return '妻财';
            if (wuxingKeMap[targetWuxing] === selfWuxing) return '官鬼';
            return '';
        }

        function calculateLiuQinAssignments(arrangedPalaceZhi, bodyIndex) {
            const bodyItem = arrangedPalaceZhi.find(item => item.palaceIndex === bodyIndex);
            if (!bodyItem) return [];
            const selfWuxing = zhiWuxingMap[bodyItem.zhi];
            const bodyPalaceWuxing = palaceWuxingMap[bodyIndex];
            const liuQinList = arrangedPalaceZhi.map((item) => {
                if (item.palaceIndex === bodyIndex) {
                    const selfLiuQin = getLiuQinByWuxing(selfWuxing, bodyPalaceWuxing);
                    return { ...item, liuQin: selfLiuQin || '身宫' };
                }
                const targetWuxing = zhiWuxingMap[item.zhi];
                const liuQin = getLiuQinByWuxing(selfWuxing, targetWuxing);
                return { ...item, liuQin };
            });

            const hasBrother = liuQinList.some(item => item.palaceIndex !== bodyIndex && item.liuQin === '兄弟');
            if (!hasBrother) {
                for (let step = 1; step <= 5; step++) {
                    const palaceIndex = (bodyIndex + step) % 6;
                    const target = liuQinList.find(item => item.palaceIndex === palaceIndex);
                    if (!target) continue;
                    const targetWuxing = zhiWuxingMap[target.zhi];
                    if (targetWuxing === '土') {
                        target.liuQin = '兄弟';
                        break;
                    }
                }
            }
            return liuQinList;
        }

        function calculateLiuShenAssignments(bodyZhi) {
            const liuShenOrder = ['青龙', '朱雀', '勾陈', '白虎', '玄武', '腾蛇'];
            const bodyZhiIndex = zhiOrder.indexOf(bodyZhi);
            if (bodyZhiIndex === -1) return [];
            const qingLongStartPalaceIndex = bodyZhiIndex % 6;
            const assignments = [];
            for (let step = 0; step < 6; step++) {
                assignments.push({
                    palaceIndex: (qingLongStartPalaceIndex + step) % 6,
                    liuShen: liuShenOrder[step]
                });
            }
            return assignments;
        }

        function calculateWuXingAssignments(dayPalaceIndex) {
            const wuXingOrder = ['木星', '火星', '土星', '金星', '水星', '天空'];
            const assignments = [];
            for (let step = 0; step < 6; step++) {
                assignments.push({
                    palaceIndex: (dayPalaceIndex + step) % 6,
                    wuXing: wuXingOrder[step]
                });
            }
            return assignments;
        }

        function arrangePalaceZhiByTimePalace(timePalaceIndex, timeZhi) {
            const startZhiIndex = zhiOrder.indexOf(timeZhi);
            if (startZhiIndex === -1) return [];
            const arranged = [];
            for (let step = 0; step < 6; step++) {
                const palaceIndex = (timePalaceIndex + step) % 6;
                const zhiIndex = (startZhiIndex + step * 2) % zhiOrder.length;
                const zhi = zhiOrder[zhiIndex];
                arranged.push({ palaceIndex, zhi });
            }
            return arranged;
        }

        function startCalculation() {
            const methodValue = String(document.getElementById('method')?.value || '').trim();
            const manualInput = document.getElementById('dateTimeManualInput');
            const validDate = validateManualDateTimeInput(manualInput.value, { report: true });
            if (!validDate) {
                manualInput.focus();
                return;
            }
            setDateTimeValue(toDateTimeLocalValue(validDate));
            const inputVal = document.getElementById('dateTime').value;
            const targetDate = inputVal ? new Date(inputVal) : new Date();
            const lunar = Lunar.fromDate(targetDate);

            clearPalaceLayoutTexts();
            setPalaceNameUnderlineVisible(false);

            const timeZhi = lunar.getTimeZhi();
            const bodyCount = getShiChenCount(timeZhi);
            let basePalaceIndex = 0;
            let bodyIndex = 0;
            if (methodValue === '数字起卦') {
                const numInputEl = document.getElementById('numInput');
                const rawNum = String(numInputEl?.value || '').trim();
                const parsedNum = Number(rawNum);
                if (!Number.isInteger(parsedNum) || parsedNum < 1) {
                    window.alert('请输入有效数字（正整数）后再排盘。');
                    if (numInputEl && typeof numInputEl.focus === 'function') {
                        numInputEl.focus();
                    }
                    return;
                }
                const numberCount = getNumberPalaceCount(parsedNum);
                basePalaceIndex = (numberCount - 1) % 6;
                bodyIndex = (basePalaceIndex + bodyCount - 1) % 6;
                setNumberTimeAndBodyLabel(basePalaceIndex, bodyIndex);
            } else {
                const dayCount = lunar.getDay();
                basePalaceIndex = (dayCount - 1) % 6;
                bodyIndex = (basePalaceIndex + bodyCount - 1) % 6;
                setDayLabel(basePalaceIndex);
                setTimeAndBodyLabel(basePalaceIndex, bodyIndex);
            }

            const arrangedPalaceZhi = arrangePalaceZhiByTimePalace(bodyIndex, timeZhi);
            arrangedPalaceZhi.forEach(({ palaceIndex, zhi }) => setZhiLabel(palaceIndex, zhi));

            const liuQinAssignments = calculateLiuQinAssignments(arrangedPalaceZhi, bodyIndex);
            liuQinAssignments.forEach(({ palaceIndex, liuQin }) => setLiuQinLabel(palaceIndex, liuQin));

            const liuShenAssignments = calculateLiuShenAssignments(timeZhi);
            liuShenAssignments.forEach(({ palaceIndex, liuShen }) => setLiuShenLabel(palaceIndex, liuShen));

            const wuXingAssignments = calculateWuXingAssignments(basePalaceIndex);
            wuXingAssignments.forEach(({ palaceIndex, wuXing }) => setWuXingLabel(palaceIndex, wuXing));

            setPalaceNameUnderlineVisible(true);
            refreshAllNotePalacePreviews();
            clearCurrentPageNotesContent({ preserveQuestionFields: true });
        }

        setInterval(updateClock, 1000);
        updateClock();
        initGrid();
        ensureDefaultCurrentDateTime();

        function clearCurrentPageNotesContent(options = {}) {
            const { preserveQuestionFields = false } = options;
            activeEditingNoteId = null;
            if (!preserveQuestionFields && queryItemSelect) {
                queryItemSelect.value = MAIN_PANEL_QUERY_ITEM_OPTIONS[0].value;
                queryItemSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (!preserveQuestionFields && specificQuestionInput) {
                specificQuestionInput.value = '';
                autoResizeTextarea(specificQuestionInput, getSpecificQuestionMinHeightPx());
            }
            if (notesEntriesContainer) {
                notesEntriesContainer.innerHTML = '';
            }
            setNoteRowDeleteMode(false);
            closeAllNotePalaceSelectors();
        }

        const manualInput = document.getElementById('dateTimeManualInput');
        const numInputEl = document.getElementById('numInput');
        if (numInputEl instanceof HTMLInputElement) {
            const clampPositiveInteger = () => {
                const raw = numInputEl.value.trim();
                if (raw === '') return;
                const n = Number(raw);
                if (!Number.isFinite(n)) {
                    numInputEl.value = '';
                    return;
                }
                const k = Math.trunc(n);
                if (k < 1) {
                    numInputEl.value = '';
                    return;
                }
                if (k !== n) numInputEl.value = String(k);
            };
            numInputEl.addEventListener('input', clampPositiveInteger);
            numInputEl.addEventListener('blur', clampPositiveInteger);
        }
        const numRandomButton = document.getElementById('numRandomButton');
        if (numRandomButton instanceof HTMLButtonElement && numInputEl instanceof HTMLInputElement) {
            numRandomButton.addEventListener('click', () => {
                numInputEl.value = '';
                numInputEl.value = String(Math.floor(Math.random() * 1000) + 1);
            });
        }
        const dateTimePickerButton = document.getElementById('dateTimePickerButton');
        const dateTimeNowButton = document.getElementById('dateTimeNowButton');
        const dateTimeCalendarInput = document.getElementById('dateTimeCalendarInput');
        const closeOpenCustomSelects = (container, exceptNode = null) => {
            if (!container) return;
            const opened = container.querySelectorAll('.global-dropdown.is-open');
            opened.forEach((node) => {
                if (exceptNode && node === exceptNode) return;
                node.classList.remove('is-open');
                const list = node.querySelector('.global-dropdown-list');
                const trigger = node.querySelector('.global-dropdown-trigger');
                if (list) list.classList.add('is-hidden');
                if (trigger) trigger.setAttribute('aria-expanded', 'false');
            });
        };
        const createCustomSelect = ({
            rootElement = null,
            rootClassName = '',
            options = [],
            onSelect = () => {},
            closeScopeElement = null,
            bindDocumentClose = false,
            emptyLabel = '',
            centerSelectedOnOpen = false,
            triggerId = ''
        }) => {
            const root = rootElement ?? document.createElement('div');
            if (!rootElement) {
                root.className = `global-dropdown ${rootClassName}`.trim();
            } else {
                root.classList.add('global-dropdown');
                rootClassName
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .forEach((cls) => root.classList.add(cls));
            }
            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'global-dropdown-trigger';
            if (triggerId) {
                trigger.id = triggerId;
            }
            trigger.setAttribute('aria-haspopup', 'listbox');
            trigger.setAttribute('aria-expanded', 'false');
            const triggerLabel = document.createElement('span');
            trigger.appendChild(triggerLabel);
            const list = document.createElement('div');
            list.className = 'global-dropdown-list is-hidden';
            list.setAttribute('role', 'listbox');
            const optionButtons = new Map();
            const closeList = () => {
                root.classList.remove('is-open');
                list.classList.add('is-hidden');
                trigger.setAttribute('aria-expanded', 'false');
            };
            const openList = () => {
                const scope = closeScopeElement || root.parentElement || document;
                closeOpenCustomSelects(scope, root);
                root.classList.add('is-open');
                list.classList.remove('is-hidden');
                trigger.setAttribute('aria-expanded', 'true');
                if (centerSelectedOnOpen) {
                    window.requestAnimationFrame(() => {
                        const selectedOption = list.querySelector('.global-dropdown-option.is-selected');
                        if (!selectedOption) return;
                        const targetTop = selectedOption.offsetTop - (list.clientHeight - selectedOption.offsetHeight) / 2;
                        list.scrollTop = Math.max(0, targetTop);
                    });
                }
            };
            const setValue = (value) => {
                const fallback = options[0];
                const matched = options.find((item) => item.value === value) || fallback;
                if (!matched) return;
                triggerLabel.textContent = matched.label.trim() ? matched.label : emptyLabel;
                optionButtons.forEach((button, buttonValue) => {
                    const selected = buttonValue === matched.value;
                    button.classList.toggle('is-selected', selected);
                    button.setAttribute('aria-selected', selected ? 'true' : 'false');
                });
            };
            options.forEach((item) => {
                const optionButton = document.createElement('button');
                optionButton.type = 'button';
                optionButton.className = 'global-dropdown-option';
                optionButton.dataset.value = item.value;
                optionButton.setAttribute('role', 'option');
                optionButton.textContent = item.label.trim() ? item.label : emptyLabel;
                optionButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    onSelect(item.value);
                    setValue(item.value);
                    closeList();
                });
                list.appendChild(optionButton);
                optionButtons.set(item.value, optionButton);
            });
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (root.classList.contains('is-open')) {
                    closeList();
                } else {
                    openList();
                }
            });
            if (bindDocumentClose) {
                document.addEventListener('mousedown', (event) => {
                    if (root.contains(event.target)) return;
                    closeList();
                });
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') closeList();
                });
            }
            root.appendChild(trigger);
            root.appendChild(list);
            return { root, setValue, closeList };
        };
        const MAIN_PANEL_QUERY_ITEM_OPTIONS = [
            { value: '吉凶', label: '吉凶' },
            { value: '感情', label: '感情' },
            { value: '事业', label: '事业' },
            { value: '财运', label: '财运' },
            { value: '健康', label: '健康' },
            { value: '学业', label: '学业' },
            { value: '其他', label: '其他' }
        ];
        const MAIN_PANEL_METHOD_OPTIONS = [
            { value: '日时起卦', label: '日时起卦' },
            { value: '数字起卦', label: '数字起卦' }
        ];
        let queryItemCustomSelectApi = null;
        const initMainPanelCustomDropdowns = () => {
            const mountInWrap = (hiddenInputId, rootClassName, options, triggerId) => {
                const hiddenInput = document.getElementById(hiddenInputId);
                const root = hiddenInput?.closest('.global-dropdown');
                if (!root || !hiddenInput || !root.contains(hiddenInput) || root.querySelector('.global-dropdown-trigger') || !options.length) {
                    return null;
                }
                const ui = createCustomSelect({
                    rootElement: root,
                    rootClassName,
                    options,
                    triggerId,
                    closeScopeElement: document,
                    bindDocumentClose: true,
                    emptyLabel: '',
                    onSelect: (value) => {
                        if (hiddenInput.value === value) return;
                        hiddenInput.value = value;
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                });
                const initial = hiddenInput.value || options[0].value;
                ui.setValue(initial);
                return ui;
            };
            queryItemCustomSelectApi = mountInWrap(
                'queryItem',
                'dropdown-query-item',
                MAIN_PANEL_QUERY_ITEM_OPTIONS,
                'queryItemTrigger'
            );
            const queryHidden = document.getElementById('queryItem');
            if (queryHidden && queryItemCustomSelectApi) {
                queryHidden.addEventListener('change', () => {
                    queryItemCustomSelectApi.setValue(queryHidden.value);
                });
            }
            mountInWrap('method', 'dropdown-method', MAIN_PANEL_METHOD_OPTIONS, 'methodTrigger');
            const syncDivinationMethodSections = () => {
                const v = String(document.getElementById('method')?.value || '').trim();
                const datetimeSection = document.getElementById('datetime-section');
                const numSection = document.getElementById('num-section');
                const showDatetime = v === '日时起卦' || v === '数字起卦';
                if (datetimeSection) {
                    datetimeSection.classList.toggle('is-hidden', !showDatetime);
                }
                if (numSection) {
                    numSection.classList.toggle('is-hidden', v !== '数字起卦');
                }
            };
            const methodHiddenInput = document.getElementById('method');
            if (methodHiddenInput) {
                methodHiddenInput.addEventListener('change', syncDivinationMethodSections);
            }
            syncDivinationMethodSections();
        };
        const notesEntriesContainer = document.getElementById('notesEntriesContainer');
        const addNoteRowButton = document.getElementById('addNoteRowButton');
        const removeNoteRowButton = document.getElementById('removeNoteRowButton');
        const saveNotesButton = document.getElementById('saveNotesButton');
        const resetBoardButton = document.getElementById('resetBoardButton');
        const openNotesLibraryButton = document.getElementById('openNotesLibraryButton');
        const clearNotesLibraryButton = document.getElementById('clearNotesLibraryButton');
        const closeNotesLibraryButton = document.getElementById('closeNotesLibraryButton');
        const notesLibraryPanel = document.getElementById('notesLibraryPanel');
        const notesLibraryBackdrop = document.getElementById('notesLibraryBackdrop');
        const notesLibraryList = document.getElementById('notesLibraryList');
        const notesLibraryEmpty = document.getElementById('notesLibraryEmpty');
        const notesLibraryItemTemplate = document.getElementById('notesLibraryItemTemplate');
        const queryItemSelect = document.getElementById('queryItem');
        const specificQuestionInput = document.getElementById('specificQuestion');
        const changePromptButton = document.getElementById('changePrompt');
        const promptEditorPanel = document.getElementById('promptEditorPanel');
        const promptEditorBackdrop = document.getElementById('promptEditorBackdrop');
        const promptTaskLinesInput = document.getElementById('promptTaskLinesInput');
        const savePromptTaskLinesButton = document.getElementById('savePromptTaskLinesButton');
        const cancelPromptEditButton = document.getElementById('cancelPromptEditButton');
        const resetPromptTaskLinesButton = document.getElementById('resetPromptTaskLinesButton');
        const referenceHelpPanel = document.getElementById('referenceHelpPanel');
        const referenceHelpBackdrop = document.getElementById('referenceHelpBackdrop');
        const referenceHelpTitle = document.getElementById('referenceHelpTitle');
        const referenceHelpContent = document.getElementById('referenceHelpContent');
        const getSpecificQuestionMinHeightPx = () => {
            if (!(specificQuestionInput instanceof HTMLTextAreaElement)) return 80;
            const computedMinHeight = Number.parseFloat(window.getComputedStyle(specificQuestionInput).minHeight);
            return Number.isFinite(computedMinHeight) ? computedMinHeight : 80;
        };
        const askAiButton = document.getElementById('askAiButton');
        const notesPanelContainer = document.getElementById('notesPanelContainer');
        const NOTES_STORAGE_KEY = 'jiangshi_xiaoliuren_saved_notes_v1';
        const AI_TASK_LINES_STORAGE_KEY = 'jiangshi_xiaoliuren_ai_task_lines_v1';
        let askAiLoadingTimer = null;
        let askAiLoadingStep = 0;
        const stopAskAiLoadingAnimation = () => {
            if (typeof askAiLoadingTimer === 'number') {
                window.clearInterval(askAiLoadingTimer);
            }
            askAiLoadingTimer = null;
            askAiLoadingStep = 0;
        };
        const startAskAiLoadingAnimation = () => {
            if (!askAiButton) return;
            stopAskAiLoadingAnimation();
            const loadingFrames = ['思考中', '思考中.', '思考中..', '思考中...'];
            askAiButton.textContent = loadingFrames[0];
            askAiLoadingTimer = window.setInterval(() => {
                askAiLoadingStep = (askAiLoadingStep + 1) % loadingFrames.length;
                askAiButton.textContent = loadingFrames[askAiLoadingStep];
            }, 380);
        };
        const PALACE_LAYOUT_SELECTORS = ['.slot-daytime', '.slot-body', '.slot-zhi', '.slot-liuqin', '.slot-liushen', '.slot-wuxing'];
        /** 旧版快照里用过 .palace-* 作为 key，恢复时兼容读取 */
        const PALACE_LAYOUT_LEGACY_SLOT_KEYS = {
            '.slot-daytime': '.palace-daytime',
            '.slot-body': '.palace-body',
            '.slot-zhi': '.palace-zhi',
            '.slot-liuqin': '.palace-liuqin',
            '.slot-liushen': '.palace-liushen',
            '.slot-wuxing': '.palace-wuxing'
        };
        const NOTE_ROW_REORDER_ANIMATION_MS = 180;
        let noteRowDragState = null;
        let isNoteRowDeleteMode = false;
        let activeEditingNoteId = null;
        const noteRowAnimationTimers = new WeakMap();
        hasInitializedNotesPanel = true;
        function autoResizeTextarea(textareaEl, minHeightPx = 0) {
            if (!(textareaEl instanceof HTMLTextAreaElement)) return;
            // 不能用 auto：该 textarea 的基础样式是 height: 100%，会导致无法测到真实内容高度
            textareaEl.style.height = '0px';
            const targetHeight = Math.max(minHeightPx, textareaEl.scrollHeight);
            textareaEl.style.height = `${targetHeight}px`;
        }
        function bindAutoResizeTextarea(
            textareaEl,
            minHeightPx = 0,
            {
                skipInitialResize = false,
                resizeOnInput = true,
                expandOnOverflowOnly = false,
                resizeOnBlur = false,
                restoreInitialHeightOnFocus = false,
                debounceMs = 0,
                lockMinHeight = true
            } = {}
        ) {
            if (!(textareaEl instanceof HTMLTextAreaElement)) return;
            let lockedMinHeightPx = minHeightPx;
            let initialHeightPx = null;
            const getLockedMinHeight = () => {
                if (!lockMinHeight) return minHeightPx;
                const renderedHeight = Math.ceil(textareaEl.getBoundingClientRect().height || textareaEl.clientHeight || 0);
                if (renderedHeight > lockedMinHeightPx) {
                    lockedMinHeightPx = renderedHeight;
                }
                return lockedMinHeightPx;
            };
            const ensureInitialHeight = () => {
                if (Number.isFinite(initialHeightPx) && initialHeightPx > 0) return initialHeightPx;
                const renderedHeight = Math.ceil(textareaEl.getBoundingClientRect().height || textareaEl.clientHeight || 0);
                if (renderedHeight > 0) {
                    initialHeightPx = renderedHeight;
                    return initialHeightPx;
                }
                return 0;
            };
            let resizeTimerId = null;
            const runResize = () => {
                autoResizeTextarea(textareaEl, getLockedMinHeight());
            };
            if (!skipInitialResize) {
                runResize();
            }
            if (restoreInitialHeightOnFocus) {
                const restoreInitialHeight = () => {
                    const targetHeight = ensureInitialHeight();
                    if (targetHeight > 0) {
                        textareaEl.style.height = `${targetHeight}px`;
                    }
                };
                window.requestAnimationFrame(() => {
                    ensureInitialHeight();
                });
                textareaEl.addEventListener('focus', restoreInitialHeight);
            }
            if (resizeOnInput) {
                textareaEl.addEventListener('input', () => {
                    const runResizeByMode = () => {
                        if (expandOnOverflowOnly) {
                            const currentHeight = textareaEl.clientHeight;
                            const requiredHeight = textareaEl.scrollHeight;
                            if (requiredHeight <= currentHeight + 1) return;
                        }
                        runResize();
                    };
                    if (debounceMs > 0) {
                        if (resizeTimerId !== null) window.clearTimeout(resizeTimerId);
                        resizeTimerId = window.setTimeout(() => {
                            resizeTimerId = null;
                            runResizeByMode();
                        }, debounceMs);
                        return;
                    }
                    runResizeByMode();
                });
            }
            if (resizeOnBlur) {
                const runBlurResize = () => {
                    autoResizeTextarea(textareaEl, minHeightPx);
                    window.requestAnimationFrame(() => {
                        autoResizeTextarea(textareaEl, minHeightPx);
                    });
                };
                textareaEl.addEventListener('blur', runBlurResize);
                textareaEl.addEventListener('focusout', runBlurResize);
            }
        }
        const normalizeLegacyNoteRowInputs = () => {
            if (!notesEntriesContainer) return;
            const legacyInputs = notesEntriesContainer.querySelectorAll('.notes-entry-row input.notes-field-input');
            legacyInputs.forEach((inputEl) => {
                const textArea = document.createElement('textarea');
                textArea.className = inputEl.className.trim();
                textArea.placeholder = inputEl.placeholder || '请输入笔记内容';
                textArea.value = inputEl.value || '';
                textArea.rows = 1;
                textArea.wrap = 'soft';
                inputEl.replaceWith(textArea);
                bindAutoResizeTextarea(textArea, 0, {
                    skipInitialResize: true,
                    resizeOnInput: true,
                    expandOnOverflowOnly: true,
                    resizeOnBlur: true,
                    restoreInitialHeightOnFocus: true,
                    debounceMs: 220,
                    lockMinHeight: false
                });
            });
        };
        const resizeNoteRowTextarea = (row) => {
            const textArea = row?.querySelector('textarea.notes-field-input');
            if (!(textArea instanceof HTMLTextAreaElement)) return;
            autoResizeTextarea(textArea, 0);
            window.requestAnimationFrame(() => {
                autoResizeTextarea(textArea, 0);
            });
        };
        const getNotesRowsSnapshot = () => {
            if (!notesEntriesContainer) return [];
            return Array.from(notesEntriesContainer.querySelectorAll('.notes-entry-row')).map((row) => {
                const textInput = row.querySelector('.notes-field-input');
                const trigger = row.querySelector('.notes-palace-trigger');
                const palaceIndex = Number(trigger?.dataset?.palaceIndex);
                return {
                    text: textInput?.value || '',
                    noPalace: row.classList.contains('is-no-palace'),
                    palaceIndex: Number.isFinite(palaceIndex) ? palaceIndex : null
                };
            });
        };
        const getPalaceLayoutSnapshot = () => {
            const palacesLayout = [];
            for (let index = 0; index < 6; index += 1) {
                const card = document.getElementById(`palace-${index}`);
                if (!card) continue;
                const slots = {};
                PALACE_LAYOUT_SELECTORS.forEach((selector) => {
                    const slot = card.querySelector(selector);
                    if (slot) slots[selector] = slot.innerHTML || '';
                });
                palacesLayout.push({ index, slots });
            }
            const firstPalaceName = document.querySelector('#palace-0 .slot-palace-name');
            return {
                underlineVisible: firstPalaceName?.classList.contains('show-underline') || false,
                palacesLayout
            };
        };
        const restorePalaceLayoutSnapshot = (layoutSnapshot) => {
            if (!layoutSnapshot || !Array.isArray(layoutSnapshot.palacesLayout)) return;
            layoutSnapshot.palacesLayout.forEach((palaceState) => {
                if (!palaceState || !Number.isFinite(palaceState.index) || typeof palaceState.slots !== 'object') return;
                const card = document.getElementById(`palace-${palaceState.index}`);
                if (!card) return;
                PALACE_LAYOUT_SELECTORS.forEach((selector) => {
                    const legacyKey = PALACE_LAYOUT_LEGACY_SLOT_KEYS[selector];
                    const raw =
                        palaceState.slots[selector] ??
                        (legacyKey && Object.prototype.hasOwnProperty.call(palaceState.slots, legacyKey)
                            ? palaceState.slots[legacyKey]
                            : undefined);
                    if (raw === undefined) return;
                    const slot = card.querySelector(selector);
                    if (!slot) return;
                    slot.innerHTML = String(raw || '');
                });
            });
            setPalaceNameUnderlineVisible(Boolean(layoutSnapshot.underlineVisible));
        };
        const formatLibraryTimestamp = (value) => {
            const date = new Date(value);
            if (!Number.isFinite(date.getTime())) return '未知时间';
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            return `${y}/${m}/${d} ${hh}:${mm}`;
        };
        const PANEL_CLOSE_SCALE_TARGET = 0.96;
        const PANEL_CLOSE_SCALE_EPSILON = 0.002;
        const PANEL_CLOSE_MAX_WAIT_MS = 500;
        const panelHideWatcherMap = new WeakMap();
        const clearPanelHideWatcher = (element) => {
            if (!element) return;
            const frameId = panelHideWatcherMap.get(element);
            if (typeof frameId === 'number') {
                window.cancelAnimationFrame(frameId);
            }
            panelHideWatcherMap.delete(element);
        };
        const shouldWaitForScaleClose = (element) => {
            if (!element) return false;
            return element.classList.contains('notes-library-panel')
                || element.classList.contains('prompt-editor-panel')
                || element.classList.contains('reference-help-panel');
        };
        const getElementScaleValue = (element) => {
            if (!element) return 1;
            const transformValue = window.getComputedStyle(element).transform;
            if (!transformValue || transformValue === 'none') return 1;
            const matrix3dMatch = transformValue.match(/^matrix3d\((.+)\)$/);
            if (matrix3dMatch) {
                const values = matrix3dMatch[1].split(',').map((item) => Number.parseFloat(item.trim()));
                return Number.isFinite(values[0]) ? values[0] : 1;
            }
            const matrixMatch = transformValue.match(/^matrix\((.+)\)$/);
            if (matrixMatch) {
                const values = matrixMatch[1].split(',').map((item) => Number.parseFloat(item.trim()));
                return Number.isFinite(values[0]) ? values[0] : 1;
            }
            return 1;
        };
        const showAnimatedElement = (element) => {
            if (!element) return;
            clearPanelHideWatcher(element);
            element.classList.remove('is-hidden');
            window.requestAnimationFrame(() => {
                element.classList.add('is-open');
            });
        };
        const hideAnimatedElement = (element) => {
            if (!element) return;
            clearPanelHideWatcher(element);
            element.classList.remove('is-open');
            if (!shouldWaitForScaleClose(element)) {
                element.classList.add('is-hidden');
                return;
            }
            const closeStartedAt = performance.now();
            const waitForCloseScale = () => {
                if (element.classList.contains('is-open')) {
                    panelHideWatcherMap.delete(element);
                    return;
                }
                const currentScale = getElementScaleValue(element);
                const waitedMs = performance.now() - closeStartedAt;
                if (currentScale <= PANEL_CLOSE_SCALE_TARGET + PANEL_CLOSE_SCALE_EPSILON || waitedMs >= PANEL_CLOSE_MAX_WAIT_MS) {
                    element.classList.add('is-hidden');
                    panelHideWatcherMap.delete(element);
                    return;
                }
                const frameId = window.requestAnimationFrame(waitForCloseScale);
                panelHideWatcherMap.set(element, frameId);
            };
            const initialFrameId = window.requestAnimationFrame(waitForCloseScale);
            panelHideWatcherMap.set(element, initialFrameId);
        };
        const syncNotesLibraryPanelTopWithButton = () => {
            if (!notesLibraryPanel || !openNotesLibraryButton) return;
            const buttonRect = openNotesLibraryButton.getBoundingClientRect();
            const panelTop = Math.max(12, buttonRect.bottom + window.scrollY + 0.8 * 16);
            notesLibraryPanel.style.setProperty('--notes-library-panel-top', `${panelTop}px`);
        };
        const closeNotesLibraryPanel = () => {
            hideAnimatedElement(notesLibraryPanel);
            hideAnimatedElement(notesLibraryBackdrop);
        };
        const openNotesLibraryPanel = () => {
            if (!notesLibraryPanel) return;
            renderNotesLibraryList();
            syncNotesLibraryPanelTopWithButton();
            showAnimatedElement(notesLibraryPanel);
            showAnimatedElement(notesLibraryBackdrop);
        };
        const toggleNotesLibraryPanel = () => {
            if (!notesLibraryPanel) return;
            if (!notesLibraryPanel.classList.contains('is-open')) {
                openNotesLibraryPanel();
                return;
            }
            closeNotesLibraryPanel();
        };
        const getNotesLibraryFromStorage = () => {
            try {
                const raw = localStorage.getItem(NOTES_STORAGE_KEY);
                if (!raw) return [];
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.filter((item) => item && typeof item === 'object');
                if (parsed && typeof parsed === 'object') return [parsed];
                return [];
            } catch (error) {
                console.error('读取笔记库失败:', error);
                return [];
            }
        };
        const persistNotesLibraryToStorage = (notesLibrary) => {
            try {
                localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesLibrary));
                return true;
            } catch (error) {
                console.error('写入笔记库失败:', error);
                return false;
            }
        };
        const buildCurrentNotesSnapshot = (noteId = null) => {
            const dateTimeValue = document.getElementById('dateTime')?.value || '';
            const methodValue = String(document.getElementById('method')?.value || '').trim();
            const selectedNumber = String(document.getElementById('numInput')?.value || '').trim();
            return {
                id: noteId || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
                version: 1,
                savedAt: Date.now(),
                methodValue,
                dateTimeValue,
                selectedNumber,
                palaceLayout: getPalaceLayoutSnapshot(),
                queryItem: queryItemSelect?.value || '',
                specificQuestion: specificQuestionInput?.value || '',
                notesRows: getNotesRowsSnapshot()
            };
        };
        const DEFAULT_AI_PROMPT_TEMPLATE = [
            '# Role',
            '你是一个精通【江氏小六壬】的专业算命师，负责根据提供的卦象进行断卦。',
            '',
            '# Task',
            '请严格按照以下逻辑进行内部推演，但**禁止**在输出中展示推演过程：',
            '1. 以用神所在宫为核心，同时兼顾身宫和对宫。',
            '2. 研判六宫、地支、六亲、六神、五星的五行生克旺衰。',
            '3. 提取对应意象（方位、意象、职业等）关联【具体问题】。',
            '4. 输出宫位总数不超过3个，以重要性从高到低排序。',
            '',
            '# Rules (必须严格遵守)',
            '- **禁止输出任何前言、开场白、结束语或分析推导过程。**',
            '- **禁止使用“好的”、“根据以上信息”等废话。**',
            '- **输出必须仅包含宫位解释和最终结论。**',
            '- 严格执行下方指定的【Output Format】。',
            '',
            '# Output Format',
            '<宫位名1>：<针对该宫位的断语>',
            '<宫位名2>：<针对该宫位的断语>',
            '（以此类推，仅列出涉及断事的关键宫位）',
            '结论：<针对求测事项的最终定性结果，一句话直击要害>',
            '',
            '---',
            '# Input Data',
            '【占问之事】：',
            '  求测事项：<求测事项>',
            '  具体问题：<具体问题>',
            '',
            '【起卦方式】：<起卦方式>',
            '',
            '【六宫卦象基础配置】：',
            '  大安：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  留连：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  速喜：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  赤口：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  小吉：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  空亡：地支 <地支>，六亲 <六亲>，六神 <六神>，五星 <五星>',
            '  身宫：<宫位名>',
            '  对宫：<宫位名>',
            '  判定规则：',
            '  - 日时起卦：身宫=时宫<宫位名>，对宫=日宫<宫位名>',
            '  - 数字起卦：身宫=时宫<宫位名>，对宫=数字宫<宫位名>'
        ].join('\n');
        let aiPromptTemplateCache = '';
        let aiTaskLinesOverride = null;
        const normalizeAiSlotText = (value) => {
            return String(value || '').replace(/\s+/g, ' ').trim();
        };
        const getPalaceSlotTextBySelector = (palaceIndex, selector, fallback = '未填写') => {
            const node = document.querySelector(`#palace-${palaceIndex} ${selector}`);
            const text = normalizeAiSlotText(node?.textContent || '');
            return text || fallback;
        };
        const getCurrentPalacePromptData = () => {
            return palaces.map((palaceName, palaceIndex) => ({
                palaceName,
                zhi: getPalaceSlotTextBySelector(palaceIndex, '.slot-zhi'),
                liuqin: getPalaceSlotTextBySelector(palaceIndex, '.slot-liuqin'),
                liushen: getPalaceSlotTextBySelector(palaceIndex, '.slot-liushen'),
                wuxing: getPalaceSlotTextBySelector(palaceIndex, '.slot-wuxing')
            }));
        };
        const getPalaceNameBySlotMarker = (selector, markerText) => {
            const marker = String(markerText || '').trim();
            if (!marker) return '';
            for (let palaceIndex = 0; palaceIndex < palaces.length; palaceIndex++) {
                const node = document.querySelector(`#palace-${palaceIndex} ${selector}`);
                const text = normalizeAiSlotText(node?.textContent || '');
                if (text.includes(marker)) {
                    return palaces[palaceIndex] || '';
                }
            }
            return '';
        };
        const fillPromptPalacePlaceholders = (templateText, options = {}) => {
            let nextText = String(templateText || '');
            const bodyPalaceName = String(options.bodyPalaceName || '').trim() || '未填写';
            const currentOppositePalaceName = String(options.currentOppositePalaceName || '').trim() || '未填写';
            const dayOppositePalaceName = String(options.dayOppositePalaceName || '').trim() || '未填写';
            const numberOppositePalaceName = String(options.numberOppositePalaceName || '').trim() || '未填写';
            nextText = nextText.replace(/(\s*身宫：)\s*<宫位名>/m, `$1${bodyPalaceName}`);
            nextText = nextText.replace(/(\s*对宫：)\s*<宫位名>/m, `$1${currentOppositePalaceName}`);
            nextText = nextText.replace(
                /(\-\s*日时起卦：身宫=时宫)<宫位名>(，对宫=日宫)<宫位名>/,
                `$1${bodyPalaceName}$2${dayOppositePalaceName}`
            );
            nextText = nextText.replace(
                /(\-\s*数字起卦：身宫=时宫)<宫位名>(，对宫=数字宫)<宫位名>/,
                `$1${bodyPalaceName}$2${numberOppositePalaceName}`
            );
            return nextText;
        };
        const upsertPalacePromptLine = (templateText, palaceInfo) => {
            const line = `  ${palaceInfo.palaceName}：地支 ${palaceInfo.zhi}，六亲 ${palaceInfo.liuqin}，六神 ${palaceInfo.liushen}，五星 ${palaceInfo.wuxing}`;
            const lineRegex = new RegExp(`^\\s*${palaceInfo.palaceName}：.*$`, 'm');
            if (lineRegex.test(templateText)) {
                return templateText.replace(lineRegex, line);
            }
            return `${templateText}\n${line}`;
        };
        const getAiPromptTemplateText = async () => {
            if (aiPromptTemplateCache) return aiPromptTemplateCache;
            try {
                const response = await fetch('/docs/prompt.txt', { cache: 'no-store' });
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.trim()) {
                        aiPromptTemplateCache = text;
                        return aiPromptTemplateCache;
                    }
                }
            } catch (error) {
                console.warn('读取 docs/prompt.txt 失败，使用默认模板:', error);
            }
            aiPromptTemplateCache = DEFAULT_AI_PROMPT_TEMPLATE;
            return aiPromptTemplateCache;
        };
        const normalizePromptTaskLineInput = (line) => {
            return String(line || '').replace(/^\s*\d+\.\s*/, '').trim();
        };
        const parsePromptTaskLinesFromInput = (rawText) => {
            return String(rawText || '')
                .split(/\r?\n/)
                .map((line) => normalizePromptTaskLineInput(line))
                .filter(Boolean);
        };
        const formatPromptTaskLinesForEditor = (taskLines) => {
            const sanitizedLines = Array.isArray(taskLines)
                ? taskLines.map((line) => normalizePromptTaskLineInput(line)).filter(Boolean)
                : [];
            return sanitizedLines.map((line, index) => `${index + 1}. ${line}`).join('\n');
        };
        const findPromptTaskSectionRange = (lines) => {
            const taskHeaderIndex = lines.findIndex((line) => /^#\s*Task\b/i.test(String(line || '').trim()));
            if (taskHeaderIndex < 0) return null;
            const nextHeaderOffset = lines
                .slice(taskHeaderIndex + 1)
                .findIndex((line) => /^#\s+\S+/.test(String(line || '').trim()));
            const sectionEnd = nextHeaderOffset < 0 ? lines.length : taskHeaderIndex + 1 + nextHeaderOffset;
            return {
                sectionStart: taskHeaderIndex + 1,
                sectionEnd
            };
        };
        const extractPromptTaskLines = (templateText) => {
            const lines = String(templateText || '').split(/\r?\n/);
            const range = findPromptTaskSectionRange(lines);
            if (!range) return [];
            return lines
                .slice(range.sectionStart, range.sectionEnd)
                .map((line) => String(line || '').trim())
                .filter((line) => /^\d+\.\s+/.test(line))
                .map((line) => normalizePromptTaskLineInput(line));
        };
        const replacePromptTaskLines = (templateText, taskLines) => {
            const sanitizedLines = Array.isArray(taskLines)
                ? taskLines.map((line) => normalizePromptTaskLineInput(line)).filter(Boolean)
                : [];
            if (!sanitizedLines.length) return templateText;
            const lines = String(templateText || '').split(/\r?\n/);
            const range = findPromptTaskSectionRange(lines);
            if (!range) return templateText;
            const sectionLines = lines.slice(range.sectionStart, range.sectionEnd);
            let firstNumberedIndex = -1;
            let lastNumberedIndex = -1;
            let numberedIndent = '';
            sectionLines.forEach((line, index) => {
                const match = String(line || '').match(/^(\s*)\d+\.\s+/);
                if (!match) return;
                if (firstNumberedIndex < 0) {
                    firstNumberedIndex = index;
                    numberedIndent = match[1] || '';
                }
                lastNumberedIndex = index;
            });
            if (firstNumberedIndex < 0 || lastNumberedIndex < firstNumberedIndex) {
                return templateText;
            }
            const replacedNumberedLines = sanitizedLines.map((line, index) => `${numberedIndent}${index + 1}. ${line}`);
            const nextSectionLines = [
                ...sectionLines.slice(0, firstNumberedIndex),
                ...replacedNumberedLines,
                ...sectionLines.slice(lastNumberedIndex + 1)
            ];
            return [
                ...lines.slice(0, range.sectionStart),
                ...nextSectionLines,
                ...lines.slice(range.sectionEnd)
            ].join('\n');
        };
        const getSavedPromptTaskLines = () => {
            try {
                const raw = localStorage.getItem(AI_TASK_LINES_STORAGE_KEY);
                if (!raw) return [];
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) return [];
                return parsed
                    .map((line) => normalizePromptTaskLineInput(line))
                    .filter(Boolean);
            } catch (error) {
                console.warn('读取 AI Task 行配置失败，使用模板默认值:', error);
                return [];
            }
        };
        const savePromptTaskLinesToStorage = (taskLines) => {
            const sanitizedLines = Array.isArray(taskLines)
                ? taskLines.map((line) => normalizePromptTaskLineInput(line)).filter(Boolean)
                : [];
            try {
                localStorage.setItem(AI_TASK_LINES_STORAGE_KEY, JSON.stringify(sanitizedLines));
                return true;
            } catch (error) {
                console.warn('保存 AI Task 行配置失败:', error);
                return false;
            }
        };
        const getDefaultPromptTaskLines = () => {
            const templateTaskLines = extractPromptTaskLines(DEFAULT_AI_PROMPT_TEMPLATE);
            return templateTaskLines.length ? templateTaskLines : ['取准用神并分析关键宫位'];
        };
        const ensurePromptTaskLinesOverrideLoaded = () => {
            if (aiTaskLinesOverride !== null) return;
            aiTaskLinesOverride = getSavedPromptTaskLines();
        };
        const getPromptTaskLinesForEditor = async () => {
            ensurePromptTaskLinesOverrideLoaded();
            if (Array.isArray(aiTaskLinesOverride) && aiTaskLinesOverride.length) {
                return [...aiTaskLinesOverride];
            }
            const promptTemplate = await getAiPromptTemplateText();
            const taskLinesFromTemplate = extractPromptTaskLines(promptTemplate);
            if (taskLinesFromTemplate.length) return taskLinesFromTemplate;
            return getDefaultPromptTaskLines();
        };
        const closePromptEditorPanel = () => {
            if (!promptEditorPanel) return;
            hideAnimatedElement(promptEditorPanel);
            hideAnimatedElement(promptEditorBackdrop);
        };
        const openPromptEditorPanel = async () => {
            if (!(promptTaskLinesInput instanceof HTMLTextAreaElement) || !promptEditorPanel) return;
            const taskLines = await getPromptTaskLinesForEditor();
            promptTaskLinesInput.value = formatPromptTaskLinesForEditor(taskLines);
            showAnimatedElement(promptEditorPanel);
            showAnimatedElement(promptEditorBackdrop);
            autoResizeTextarea(promptTaskLinesInput, 0);
            promptTaskLinesInput.focus();
            promptTaskLinesInput.setSelectionRange(promptTaskLinesInput.value.length, promptTaskLinesInput.value.length);
        };
        const closeReferenceHelpPanel = () => {
            if (!referenceHelpPanel) return;
            hideAnimatedElement(referenceHelpPanel);
            hideAnimatedElement(referenceHelpBackdrop);
        };
        const openReferenceHelpPanel = async ({ categoryKey, label }) => {
            if (!referenceHelpPanel || !label) return;
            const referenceHelpDoc = await loadReferenceHelpDoc();
            const categoryConfig = referenceHelpDoc.categories?.[categoryKey];
            const description = categoryConfig?.items?.[label] || '';
            if (!description) return;
            if (referenceHelpTitle) {
                referenceHelpTitle.textContent = `${label} · 术语解释`;
            }
            renderReferenceHelpContent(description, {
                categoryKey,
                label,
                referenceHelpDoc
            });
            showAnimatedElement(referenceHelpPanel);
            showAnimatedElement(referenceHelpBackdrop);
        };
        const bindMainPanelReferenceHelpInteraction = () => {
            const mainPanel = document.getElementById('mainPanel');
            if (!mainPanel) return;
            mainPanel.addEventListener('click', async (event) => {
                const target = event.target;
                if (!(target instanceof Element)) return;
                const slot = target.closest('.slot-wuxing, .slot-liushen, .slot-liuqin, .slot-palace-name');
                if (!(slot instanceof HTMLElement)) return;
                const categoryClass = Object.keys(REFERENCE_SLOT_CATEGORY_MAP).find((className) => slot.classList.contains(className));
                if (!categoryClass) return;
                const label = String(slot.textContent || '').trim();
                if (!label) return;
                await openReferenceHelpPanel({
                    categoryKey: REFERENCE_SLOT_CATEGORY_MAP[categoryClass],
                    label
                });
            });
        };
        const savePromptTaskLinesFromEditor = () => {
            if (!(promptTaskLinesInput instanceof HTMLTextAreaElement)) return;
            const taskLines = parsePromptTaskLinesFromInput(promptTaskLinesInput.value);
            if (!taskLines.length) {
                window.alert('请至少保留一条 #Task 步骤。');
                return;
            }
            aiTaskLinesOverride = [...taskLines];
            savePromptTaskLinesToStorage(aiTaskLinesOverride);
            closePromptEditorPanel();
        };
        const resetPromptTaskLinesInEditor = () => {
            const defaultTaskLines = getDefaultPromptTaskLines();
            aiTaskLinesOverride = [...defaultTaskLines];
            savePromptTaskLinesToStorage(aiTaskLinesOverride);
            if (promptTaskLinesInput instanceof HTMLTextAreaElement) {
                promptTaskLinesInput.value = formatPromptTaskLinesForEditor(aiTaskLinesOverride);
                autoResizeTextarea(promptTaskLinesInput, 0);
            }
        };
        const buildAiPrompt = async () => {
            const queryItem = (queryItemSelect?.value || '').trim();
            const specificQuestion = (specificQuestionInput?.value || '').trim();
            const divinationMethod =
                String(document.getElementById('method')?.value || '').trim() ||
                MAIN_PANEL_METHOD_OPTIONS[0].value;
            const notesRows = getNotesRowsSnapshot();
            const notesText = notesRows
                .map((row, index) => {
                    const content = String(row?.text || '').trim();
                    return content ? `${index + 1}. ${content}` : '';
                })
                .filter(Boolean)
                .join('\n');
            let prompt = await getAiPromptTemplateText();
            ensurePromptTaskLinesOverrideLoaded();
            if (Array.isArray(aiTaskLinesOverride) && aiTaskLinesOverride.length) {
                prompt = replacePromptTaskLines(prompt, aiTaskLinesOverride);
            }
            prompt = prompt.replace(/<求测事项>/g, queryItem || '未填写');
            prompt = prompt.replace(/<具体问题>/g, specificQuestion || '未填写');
            prompt = prompt.replace(/<起卦方式>/g, divinationMethod);
            const palaceInfoList = getCurrentPalacePromptData();
            palaceInfoList.forEach((palaceInfo) => {
                prompt = upsertPalacePromptLine(prompt, palaceInfo);
            });
            const bodyPalaceName = getPalaceNameBySlotMarker('.slot-body', '身');
            const dayOppositePalaceName = getPalaceNameBySlotMarker('.slot-daytime', '日');
            const numberOppositePalaceName = getPalaceNameBySlotMarker('.slot-daytime', '数');
            const currentOppositePalaceName = divinationMethod === '数字起卦'
                ? (numberOppositePalaceName || dayOppositePalaceName)
                : (dayOppositePalaceName || numberOppositePalaceName);
            prompt = fillPromptPalacePlaceholders(prompt, {
                bodyPalaceName,
                currentOppositePalaceName,
                dayOppositePalaceName,
                numberOppositePalaceName
            });
            if (notesText) {
                prompt = `${prompt}\n\n【补充笔记】\n${notesText}`;
            }
            return prompt.trim();
        };
        const AI_PALACE_NAME_TO_INDEX = {
            '大安': 0,
            '留连': 1,
            '速喜': 2,
            '赤口': 3,
            '小吉': 4,
            '空亡': 5
        };
        const normalizeAiReplyLine = (line) => {
            return String(line || '')
                .trim()
                .replace(/^["'“”]+|["'“”]+$/g, '')
                .trim();
        };
        const parseAiReplyToNoteRows = (replyText) => {
            const resultRows = [];
            const lines = String(replyText || '')
                .split(/\r?\n/)
                .map((line) => normalizeAiReplyLine(line))
                .filter(Boolean);
            lines.forEach((line) => {
                const conclusionMatch = line.match(/^结论\s*[：:]\s*(.+)$/);
                if (conclusionMatch) {
                    const conclusion = (conclusionMatch[1] || '').trim();
                    if (!conclusion) return;
                    resultRows.push({
                        text: conclusion,
                        noPalace: true
                    });
                    return;
                }
                const palaceMatch = line.match(/^(大安|留连|速喜|赤口|小吉|空亡)\s*(?:宫)?\s*[：:]\s*(.+)$/);
                if (palaceMatch) {
                    const palaceName = palaceMatch[1];
                    const explanation = (palaceMatch[2] || '').trim();
                    if (!explanation) return;
                    resultRows.push({
                        text: explanation,
                        noPalace: false,
                        palaceIndex: AI_PALACE_NAME_TO_INDEX[palaceName]
                    });
                    return;
                }

                // Keep non-standard palace lines (e.g., 用神宫/时宫/日宫) instead of dropping them.
                const genericSectionMatch = line.match(/^([^：:\s][^：:]{0,20})\s*[：:]\s*(.+)$/);
                if (genericSectionMatch) {
                    const sectionName = (genericSectionMatch[1] || '').trim();
                    const sectionContent = (genericSectionMatch[2] || '').trim();
                    if (!sectionContent) return;
                    resultRows.push({
                        text: `${sectionName}：${sectionContent}`,
                        noPalace: true
                    });
                }
            });
            return resultRows;
        };
        const appendAiReplyRowsToNotes = (replyText) => {
            if (!notesEntriesContainer) return;
            const parsedRows = parseAiReplyToNoteRows(replyText);
            if (parsedRows.length) {
                parsedRows.forEach((rowData) => {
                    const row = createNoteEntryRow(rowData);
                    notesEntriesContainer.appendChild(row);
                    resizeNoteRowTextarea(row);
                });
                return;
            }
            const fallbackRow = createNoteEntryRow({
                text: replyText,
                noPalace: true
            });
            notesEntriesContainer.appendChild(fallbackRow);
            resizeNoteRowTextarea(fallbackRow);
        };
        const hasCalculatedPalaceLayout = () => {
            return palaces.some((_, palaceIndex) => {
                const zhi = getPalaceSlotTextBySelector(palaceIndex, '.slot-zhi', '');
                const liuqin = getPalaceSlotTextBySelector(palaceIndex, '.slot-liuqin', '');
                const liushen = getPalaceSlotTextBySelector(palaceIndex, '.slot-liushen', '');
                const wuxing = getPalaceSlotTextBySelector(palaceIndex, '.slot-wuxing', '');
                return Boolean(zhi || liuqin || liushen || wuxing);
            });
        };
        const requestAiAnswer = async () => {
            if (!hasCalculatedPalaceLayout()) {
                window.alert('当前还没有排盘盘面，请先点击“开始排盘”后再问AI。');
                return;
            }
            const queryItem = (queryItemSelect?.value || '').trim();
            const specificQuestion = (specificQuestionInput?.value || '').trim();
            if (!queryItem && !specificQuestion) {
                window.alert('请先填写“求测事项”或“具体问题”后再问AI。');
                return;
            }
            const prompt = await buildAiPrompt();
            if (askAiButton) {
                askAiButton.disabled = true;
                askAiButton.dataset.originalLabel = askAiButton.textContent || '问AI';
                startAskAiLoadingAnimation();
            }
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        prompt
                    })
                });
                const data = await response.json().catch(() => ({}));
                if (!response.ok) {
                    const message = typeof data?.error === 'string' && data.error ? data.error : 'AI 请求失败';
                    throw new Error(message);
                }
                const reply = typeof data?.reply === 'string' ? data.reply.trim() : '';
                if (!reply) {
                    throw new Error('AI 返回为空，请稍后重试');
                }
                appendAiReplyRowsToNotes(reply);
            } catch (error) {
                console.error('问AI失败:', error);
                window.alert(`问AI失败：${error?.message || '未知错误'}`);
            } finally {
                if (askAiButton) {
                    stopAskAiLoadingAnimation();
                    askAiButton.disabled = false;
                    askAiButton.textContent = askAiButton.dataset.originalLabel || '问AI';
                }
            }
        };
        const applyNotesSnapshot = (parsed) => {
            if (!parsed || typeof parsed !== 'object') return;
            const restoredNoteId = typeof parsed.id === 'string' && parsed.id ? parsed.id : null;
            const methodInput = document.getElementById('method');
            if (methodInput && typeof parsed.methodValue === 'string') {
                const allowedMethodValues = new Set(MAIN_PANEL_METHOD_OPTIONS.map((o) => o.value));
                const restoredMethodValue = parsed.methodValue.trim();
                methodInput.value = allowedMethodValues.has(restoredMethodValue)
                    ? restoredMethodValue
                    : MAIN_PANEL_METHOD_OPTIONS[0].value;
                methodInput.dispatchEvent(new Event('change', { bubbles: true }));
            }
            const restoredDate = parseDateTimeValue(parsed.dateTimeValue);
            setDateTimeValue(restoredDate ? toDateTimeLocalValue(restoredDate) : '');
            const numInputEl = document.getElementById('numInput');
            if (numInputEl instanceof HTMLInputElement) {
                const restoredNumber = typeof parsed.selectedNumber === 'string'
                    ? parsed.selectedNumber.trim()
                    : '';
                numInputEl.value = restoredNumber;
            }
            restorePalaceLayoutSnapshot(parsed.palaceLayout);
            if (queryItemSelect && typeof parsed.queryItem === 'string') {
                const allowedQueryItems = new Set(MAIN_PANEL_QUERY_ITEM_OPTIONS.map((o) => o.value));
                const restoredQueryItem = parsed.queryItem.trim();
                queryItemSelect.value = allowedQueryItems.has(restoredQueryItem)
                    ? restoredQueryItem
                    : MAIN_PANEL_QUERY_ITEM_OPTIONS[0].value;
                queryItemSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            if (specificQuestionInput && typeof parsed.specificQuestion === 'string') {
                specificQuestionInput.value = parsed.specificQuestion;
                autoResizeTextarea(specificQuestionInput, getSpecificQuestionMinHeightPx());
            }
            if (notesEntriesContainer) {
                notesEntriesContainer.innerHTML = '';
                const savedRows = Array.isArray(parsed.notesRows) ? parsed.notesRows : [];
                savedRows.forEach((rowData) => {
                    const row = createNoteEntryRow(rowData);
                    notesEntriesContainer.appendChild(row);
                    resizeNoteRowTextarea(row);
                });
            }
            activeEditingNoteId = restoredNoteId;
            setNoteRowDeleteMode(false);
            closeAllNotePalaceSelectors();
            refreshAllNotePalacePreviews();
        };
        const renderNotesLibraryList = () => {
            if (!notesLibraryList || !notesLibraryEmpty) return;
            const notesLibrary = getNotesLibraryFromStorage();
            notesLibraryList.innerHTML = '';
            if (!notesLibrary.length) {
                notesLibraryEmpty.style.display = '';
                return;
            }
            notesLibraryEmpty.style.display = 'none';
            notesLibrary.forEach((noteItem, noteIndex) => {
                const item = notesLibraryItemTemplate?.content?.firstElementChild
                    ? notesLibraryItemTemplate.content.firstElementChild.cloneNode(true)
                    : document.createElement('div');
                if (!(item instanceof HTMLElement)) return;
                item.classList.add('notes-library-item');
                item.addEventListener('click', () => {
                    applyNotesSnapshot(noteItem);
                    closeNotesLibraryPanel();
                });
                const timeEl = item.querySelector('.notes-library-item-time') || document.createElement('div');
                if (!timeEl.classList.contains('notes-library-item-time')) {
                    timeEl.className = 'notes-library-item-time';
                }
                timeEl.textContent = formatLibraryTimestamp(noteItem.savedAt);
                const descEl = item.querySelector('.notes-library-item-desc') || document.createElement('div');
                if (!descEl.classList.contains('notes-library-item-desc')) {
                    descEl.className = 'notes-library-item-desc';
                }
                const itemType = (noteItem.queryItem || '').trim() || '未填写事项';
                const question = (noteItem.specificQuestion || '').trim() || '未填写具体问题';
                descEl.textContent = `${itemType} | ${question}`;
                if (!timeEl.parentElement || timeEl.parentElement === item) {
                    const infoWrap = document.createElement('div');
                    infoWrap.appendChild(timeEl);
                    infoWrap.appendChild(descEl);
                    item.insertBefore(infoWrap, item.firstChild);
                }
                const deleteButton = item.querySelector('.notes-library-delete-button') || document.createElement('button');
                deleteButton.type = 'button';
                if (!deleteButton.classList.contains('notes-library-delete-button')) {
                    deleteButton.className = 'notes-library-delete-button action-theme-button';
                    deleteButton.textContent = '删除';
                    item.appendChild(deleteButton);
                }
                deleteButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const latestLibrary = getNotesLibraryFromStorage();
                    if (!latestLibrary[noteIndex]) return;
                    const deletedNote = latestLibrary[noteIndex];
                    latestLibrary.splice(noteIndex, 1);
                    if (activeEditingNoteId && deletedNote?.id === activeEditingNoteId) {
                        activeEditingNoteId = null;
                    }
                    if (!persistNotesLibraryToStorage(latestLibrary)) return;
                    renderNotesLibraryList();
                });
                notesLibraryList.appendChild(item);
            });
        };
        const saveNotesToLocalStorage = () => {
            const notesLibrary = getNotesLibraryFromStorage();
            const existingIndex = activeEditingNoteId
                ? notesLibrary.findIndex((item) => item?.id === activeEditingNoteId)
                : -1;
            const payload = buildCurrentNotesSnapshot(activeEditingNoteId);
            if (existingIndex >= 0) {
                notesLibrary.splice(existingIndex, 1);
            }
            notesLibrary.unshift(payload);
            const saved = persistNotesLibraryToStorage(notesLibrary);
            if (saved) {
                activeEditingNoteId = payload.id;
                renderNotesLibraryList();
            }
            return saved;
        };
        const restoreNotesFromLocalStorage = () => {
            const notesLibrary = getNotesLibraryFromStorage();
            if (!notesLibrary.length) return;
            const latest = notesLibrary[0];
            applyNotesSnapshot(latest);
        };
        const showSaveNotesFeedback = (saved) => {
            if (!saveNotesButton) return;
            const originalText = '保存笔记';
            saveNotesButton.textContent = saved ? '已保存' : '保存失败';
            window.setTimeout(() => {
                saveNotesButton.textContent = originalText;
            }, 1000);
        };
        const setNoteRowDeleteMode = (enabled) => {
            isNoteRowDeleteMode = Boolean(enabled);
            if (notesEntriesContainer) {
                notesEntriesContainer.classList.toggle('is-delete-mode', isNoteRowDeleteMode);
            }
            if (removeNoteRowButton) {
                removeNoteRowButton.classList.toggle('is-active', isNoteRowDeleteMode);
                removeNoteRowButton.setAttribute('aria-pressed', String(isNoteRowDeleteMode));
            }
            if (isNoteRowDeleteMode) {
                closeAllNotePalaceSelectors();
            }
        };
        const clearRowAnimationTimer = (row) => {
            const timerId = noteRowAnimationTimers.get(row);
            if (!timerId) return;
            clearTimeout(timerId);
            noteRowAnimationTimers.delete(row);
        };
        const captureNoteRowRects = () => {
            if (!notesEntriesContainer) return new Map();
            const rectMap = new Map();
            notesEntriesContainer.querySelectorAll('.notes-entry-row').forEach((item) => {
                rectMap.set(item, item.getBoundingClientRect());
            });
            return rectMap;
        };
        const animateNoteRowsReflow = (previousRects) => {
            if (!notesEntriesContainer || !previousRects?.size) return;
            notesEntriesContainer.querySelectorAll('.notes-entry-row').forEach((item) => {
                const previousRect = previousRects.get(item);
                if (!previousRect) return;
                const currentRect = item.getBoundingClientRect();
                const deltaX = previousRect.left - currentRect.left;
                const deltaY = previousRect.top - currentRect.top;
                if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return;
                clearRowAnimationTimer(item);
                item.style.transition = 'none';
                item.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0)`;
                window.requestAnimationFrame(() => {
                    item.style.transition = `transform ${NOTE_ROW_REORDER_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`;
                    item.style.transform = '';
                    const timerId = window.setTimeout(() => {
                        item.style.removeProperty('transition');
                        clearRowAnimationTimer(item);
                    }, NOTE_ROW_REORDER_ANIMATION_MS);
                    noteRowAnimationTimers.set(item, timerId);
                });
            });
        };
        const updateDraggingNoteRowFollowPointer = (clientX, clientY) => {
            if (!noteRowDragState || !notesEntriesContainer) return;
            const { row, pointerOffsetX, pointerOffsetY } = noteRowDragState;
            row.style.left = `${clientX - pointerOffsetX}px`;
            row.style.top = `${clientY - pointerOffsetY}px`;
        };
        const moveDraggingNoteRowByPointerY = (clientY) => {
            if (!noteRowDragState || !notesEntriesContainer) return;
            const { placeholder } = noteRowDragState;
            const previousRects = captureNoteRowRects();
            const siblingRows = Array.from(notesEntriesContainer.querySelectorAll('.notes-entry-row'));
            let insertBeforeRow = null;
            for (const sibling of siblingRows) {
                const rect = sibling.getBoundingClientRect();
                if (clientY < rect.top + rect.height / 2) {
                    insertBeforeRow = sibling;
                    break;
                }
            }
            if (insertBeforeRow) {
                if (insertBeforeRow !== placeholder.nextElementSibling) {
                    notesEntriesContainer.insertBefore(placeholder, insertBeforeRow);
                    animateNoteRowsReflow(previousRects);
                }
                return;
            }
            if (notesEntriesContainer.lastElementChild !== placeholder) {
                notesEntriesContainer.appendChild(placeholder);
                animateNoteRowsReflow(previousRects);
            }
        };
        const endNoteRowDragging = () => {
            if (!noteRowDragState || !notesEntriesContainer) return;
            const { row, pointerId, placeholder } = noteRowDragState;
            const floatingRect = row.getBoundingClientRect();
            if (row.hasPointerCapture?.(pointerId)) {
                row.releasePointerCapture(pointerId);
            }
            row.style.removeProperty('position');
            row.style.removeProperty('left');
            row.style.removeProperty('top');
            row.style.removeProperty('width');
            row.style.removeProperty('z-index');
            row.style.removeProperty('pointer-events');
            notesEntriesContainer.insertBefore(row, placeholder);
            placeholder.remove();
            const droppedRect = row.getBoundingClientRect();
            const deltaX = floatingRect.left - droppedRect.left;
            const deltaY = floatingRect.top - droppedRect.top;
            clearRowAnimationTimer(row);
            row.style.transition = 'none';
            row.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.985)`;
            window.requestAnimationFrame(() => {
                row.style.transition = `transform ${NOTE_ROW_REORDER_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${NOTE_ROW_REORDER_ANIMATION_MS}ms ease`;
                row.classList.remove('is-dragging');
                row.style.transform = '';
                const timerId = window.setTimeout(() => {
                    row.style.removeProperty('transition');
                    clearRowAnimationTimer(row);
                }, NOTE_ROW_REORDER_ANIMATION_MS);
                noteRowAnimationTimers.set(row, timerId);
            });
            notesEntriesContainer.classList.remove('is-row-sorting');
            setTimeout(() => {
                delete row.dataset.suppressClick;
            }, 0);
            noteRowDragState = null;
        };
        const startNoteRowDragging = (row, pointerId, clientX, clientY) => {
            if (!notesEntriesContainer || noteRowDragState || row.parentElement !== notesEntriesContainer) return;
            closeAllNotePalaceSelectors();
            const rowRect = row.getBoundingClientRect();
            const placeholder = document.createElement('div');
            placeholder.className = 'notes-entry-placeholder';
            placeholder.style.height = `${rowRect.height}px`;
            notesEntriesContainer.insertBefore(placeholder, row);
            noteRowDragState = {
                row,
                pointerId,
                placeholder,
                pointerOffsetX: clientX - rowRect.left,
                pointerOffsetY: clientY - rowRect.top
            };
            row.dataset.suppressClick = '1';
            row.classList.add('is-dragging');
            notesEntriesContainer.classList.add('is-row-sorting');
            row.setPointerCapture?.(pointerId);
            row.style.position = 'fixed';
            row.style.left = `${rowRect.left}px`;
            row.style.top = `${rowRect.top}px`;
            row.style.width = `${rowRect.width}px`;
            row.style.zIndex = '999';
            row.style.pointerEvents = 'none';
            document.body.appendChild(row);
            updateDraggingNoteRowFollowPointer(clientX, clientY);
            moveDraggingNoteRowByPointerY(clientY);
        };
        const handleGlobalNoteRowPointerMove = (event) => {
            if (noteRowDragState && noteRowDragState.pointerId === event.pointerId) {
                event.preventDefault();
                updateDraggingNoteRowFollowPointer(event.clientX, event.clientY);
                moveDraggingNoteRowByPointerY(event.clientY);
            }
        };
        const handleGlobalNoteRowPointerUpOrCancel = (event) => {
            if (noteRowDragState && noteRowDragState.pointerId === event.pointerId) {
                endNoteRowDragging();
            }
        };
        const bindNoteRowReorderEvents = (row, handle) => {
            handle.addEventListener('pointerdown', (event) => {
                if (!notesEntriesContainer) return;
                if (isNoteRowDeleteMode) return;
                if (!event.isPrimary) return;
                if (event.pointerType === 'mouse' && event.button !== 0) return;
                event.preventDefault();
                event.stopPropagation();
                startNoteRowDragging(row, event.pointerId, event.clientX, event.clientY);
            });
            row.addEventListener('click', (event) => {
                if (!isNoteRowDeleteMode || noteRowDragState) return;
                event.preventDefault();
                event.stopPropagation();
                const previousRects = captureNoteRowRects();
                row.remove();
                animateNoteRowsReflow(previousRects);
                setNoteRowDeleteMode(false);
            }, true);
            row.addEventListener('click', (event) => {
                if (row.dataset.suppressClick !== '1') return;
                event.preventDefault();
                event.stopPropagation();
            }, true);
        };
        document.addEventListener('pointermove', handleGlobalNoteRowPointerMove, { passive: false });
        document.addEventListener('pointerup', handleGlobalNoteRowPointerUpOrCancel);
        document.addEventListener('pointercancel', handleGlobalNoteRowPointerUpOrCancel);
        const cssLengthToPx = (lengthText, fallbackPx = 0) => {
            const raw = (lengthText || '').trim();
            if (!raw) return fallbackPx;
            const probe = document.createElement('div');
            probe.style.position = 'absolute';
            probe.style.visibility = 'hidden';
            probe.style.width = raw;
            probe.style.height = '0';
            probe.style.pointerEvents = 'none';
            document.body.appendChild(probe);
            const px = probe.getBoundingClientRect().width;
            probe.remove();
            return Number.isFinite(px) && px > 0 ? px : fallbackPx;
        };
        const getDevicePixelAlignedValue = (value) => {
            const dpr = Math.max(1, window.devicePixelRatio || 1);
            return Math.round(value * dpr) / dpr;
        };
        const buildNotesPalaceDashSvg = ({ sizePx, strokePx, gapPx, radiusPx, color }) => {
            const dashLengthPx = getDevicePixelAlignedValue(Math.max(strokePx * 4, gapPx * 1.8));
            const insetPx = getDevicePixelAlignedValue(Math.max(strokePx / 2, 0.5));
            const rectSize = Math.max(sizePx - insetPx * 2, 1);
            const safeRadius = getDevicePixelAlignedValue(Math.max(0, Math.min(radiusPx, rectSize / 2)));
            const alignedGapPx = getDevicePixelAlignedValue(Math.max(1, gapPx));
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sizePx}" height="${sizePx}" viewBox="0 0 ${sizePx} ${sizePx}" shape-rendering="geometricPrecision"><rect x="${insetPx}" y="${insetPx}" width="${rectSize}" height="${rectSize}" rx="${safeRadius}" ry="${safeRadius}" fill="none" stroke="${color}" stroke-width="${strokePx}" stroke-dasharray="${dashLengthPx} ${alignedGapPx}" vector-effect="non-scaling-stroke"/></svg>`;
            return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
        };
        const syncNotesPalaceDashStyle = () => {
            const rootStyle = getComputedStyle(document.documentElement);
            const dashThicknessPx = getDevicePixelAlignedValue(Math.max(1, cssLengthToPx(rootStyle.getPropertyValue('--notes-palace-dash-thickness'), 2)));
            const dashGapPx = getDevicePixelAlignedValue(Math.max(1, cssLengthToPx(rootStyle.getPropertyValue('--notes-palace-dash-gap'), 12)));
            const dashOutsetPx = getDevicePixelAlignedValue(Math.max(0, cssLengthToPx(rootStyle.getPropertyValue('--notes-palace-dash-outset'), 3)));
            const borderRadiusPx = getDevicePixelAlignedValue(Math.max(0, cssLengthToPx(rootStyle.getPropertyValue('--notes-select-border-radius'), 8)));
            const color = (rootStyle.getPropertyValue('--notes-select-border-color') || '#4b3521').trim() || '#4b3521';
            const palaceSizeRaw = cssLengthToPx(rootStyle.getPropertyValue('--notes-palace-size'), 96);
            const palaceSizePx = getDevicePixelAlignedValue(Math.max(24, palaceSizeRaw));
            const svgUrl = buildNotesPalaceDashSvg({
                sizePx: getDevicePixelAlignedValue(palaceSizePx + dashOutsetPx * 2),
                strokePx: dashThicknessPx,
                gapPx: dashGapPx,
                radiusPx: getDevicePixelAlignedValue(borderRadiusPx + dashOutsetPx),
                color
            });
            document.documentElement.style.setProperty('--notes-palace-dash-svg-url', svgUrl);
        };
        const setNotePalaceTriggerPlaceholder = (trigger) => {
            trigger.innerHTML = '';
            trigger.classList.remove('is-selected');
            delete trigger.dataset.palaceIndex;
        };
        const renderNotePalacePreview = (trigger, palaceIndex) => {
            const sourceCard = document.getElementById(`palace-${palaceIndex}`);
            if (!sourceCard) {
                setNotePalaceTriggerPlaceholder(trigger);
                return;
            }
            const previewCard = sourceCard.cloneNode(true);
            previewCard.removeAttribute('id');
            previewCard.classList.add('notes-palace-preview');
            trigger.innerHTML = '';
            trigger.appendChild(previewCard);
            trigger.classList.add('is-selected');
            trigger.dataset.palaceIndex = String(palaceIndex);
        };
        const refreshAllNotePalacePreviews = () => {
            if (!notesEntriesContainer) return;
            notesEntriesContainer.querySelectorAll('.notes-palace-trigger').forEach((trigger) => {
                const palaceIndex = Number(trigger.dataset.palaceIndex);
                if (!Number.isFinite(palaceIndex)) return;
                renderNotePalacePreview(trigger, palaceIndex);
            });
        };
        const closeAllNotePalaceSelectors = (exceptPicker = null) => {
            document.querySelectorAll('.notes-palace-picker.is-open').forEach((picker) => {
                if (exceptPicker && picker === exceptPicker) return;
                picker.classList.remove('is-open');
                const popup = picker.querySelector('.notes-palace-popup');
                if (popup) popup.classList.add('is-hidden');
            });
        };
        const createNoteEntryRow = (initialData = null) => {
            const row = document.createElement('div');
            row.className = 'notes-entry-row';
            const picker = document.createElement('div');
            picker.className = 'notes-palace-picker';
            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'notes-palace-trigger';
            setNotePalaceTriggerPlaceholder(trigger);
            const popup = document.createElement('div');
            popup.className = 'notes-palace-popup is-hidden';
            /* 弹层顺序：留连/速喜/赤口 | 大安/空亡/小吉 | 不填（整行） */
            const notesPalacePopupOrder = [1, 2, 3, 0, 5, 4];
            notesPalacePopupOrder.forEach((palaceIndex) => {
                const palaceName = palaces[palaceIndex];
                const option = document.createElement('button');
                option.type = 'button';
                option.className = 'notes-palace-option';
                option.textContent = palaceName;
                option.addEventListener('click', (event) => {
                    event.preventDefault();
                    setNoPalaceMode(false);
                    renderNotePalacePreview(trigger, palaceIndex);
                    popup.classList.add('is-hidden');
                    picker.classList.remove('is-open');
                });
                popup.appendChild(option);
            });
            trigger.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const isOpen = picker.classList.contains('is-open');
                closeAllNotePalaceSelectors();
                if (!isOpen) {
                    picker.classList.add('is-open');
                    popup.classList.remove('is-hidden');
                }
            });
            picker.appendChild(trigger);
            picker.appendChild(popup);
            const textInput = document.createElement('textarea');
            textInput.className = 'notes-field-input';
            textInput.placeholder = '请输入笔记内容';
            textInput.rows = 1;
            textInput.wrap = 'soft';
            const dragHandle = document.createElement('button');
            dragHandle.type = 'button';
            dragHandle.className = 'notes-entry-handle';
            dragHandle.textContent = '⋮⋮';
            const clearNoPalaceInputAnimationState = () => {
                textInput.style.removeProperty('transition');
                textInput.style.removeProperty('width');
                textInput.style.removeProperty('margin-left');
                textInput.style.removeProperty('will-change');
            };
            const playNoPalaceExpandAnimation = (startWidthPx) => {
                clearNoPalaceInputAnimationState();
                const safeStartWidth = Math.max(1, startWidthPx);
                textInput.style.willChange = 'width';
                textInput.style.marginLeft = 'auto';
                textInput.style.width = `${safeStartWidth}px`;
                void textInput.offsetWidth;
                textInput.style.transition = 'width 280ms cubic-bezier(0.22, 1, 0.36, 1)';
                textInput.style.width = '100%';
            };
            const setNoPalaceMode = (enabled, { animate = true } = {}) => {
                const wasNoPalaceMode = row.classList.contains('is-no-palace');
                const widthBefore = textInput.getBoundingClientRect().width;
                row.classList.toggle('is-no-palace', enabled);
                if (enabled) {
                    setNotePalaceTriggerPlaceholder(trigger);
                    if (!wasNoPalaceMode && animate) {
                        window.requestAnimationFrame(() => {
                            playNoPalaceExpandAnimation(widthBefore);
                        });
                    }
                } else {
                    clearNoPalaceInputAnimationState();
                }
            };
            textInput.addEventListener('transitionend', (event) => {
                if (event.propertyName !== 'width') return;
                clearNoPalaceInputAnimationState();
            });
            const noPalaceOption = document.createElement('button');
            noPalaceOption.type = 'button';
            noPalaceOption.className = 'notes-palace-option notes-palace-option-full-row';
            noPalaceOption.textContent = '不填';
            noPalaceOption.addEventListener('click', (event) => {
                event.preventDefault();
                setNoPalaceMode(true);
                popup.classList.add('is-hidden');
                picker.classList.remove('is-open');
            });
            popup.appendChild(noPalaceOption);
            row.appendChild(picker);
            row.appendChild(textInput);
            row.appendChild(dragHandle);
            if (initialData && typeof initialData === 'object') {
                if (typeof initialData.text === 'string') {
                    textInput.value = initialData.text;
                }
                if (initialData.noPalace) {
                    setNoPalaceMode(true, { animate: false });
                } else {
                    const savedPalaceIndex = Number(initialData.palaceIndex);
                    if (Number.isFinite(savedPalaceIndex)) {
                        setNoPalaceMode(false, { animate: false });
                        renderNotePalacePreview(trigger, savedPalaceIndex);
                    }
                }
            }
            bindAutoResizeTextarea(textInput, 0, {
                skipInitialResize: true,
                resizeOnInput: true,
                expandOnOverflowOnly: true,
                resizeOnBlur: true,
                restoreInitialHeightOnFocus: true,
                debounceMs: 220,
                lockMinHeight: false
            });
            bindNoteRowReorderEvents(row, dragHandle);
            return row;
        };
        bindAutoResizeTextarea(specificQuestionInput, getSpecificQuestionMinHeightPx(), {
            resizeOnInput: true,
            resizeOnBlur: true,
            lockMinHeight: false
        });
        if (promptTaskLinesInput instanceof HTMLTextAreaElement) {
            bindAutoResizeTextarea(promptTaskLinesInput, 0, {
                resizeOnInput: true,
                resizeOnBlur: true,
                lockMinHeight: false
            });
        }
        if (addNoteRowButton && notesEntriesContainer) {
            normalizeLegacyNoteRowInputs();
            addNoteRowButton.addEventListener('click', () => {
                setNoteRowDeleteMode(false);
                notesEntriesContainer.appendChild(createNoteEntryRow());
            });
            if (removeNoteRowButton) {
                removeNoteRowButton.addEventListener('click', () => {
                    if (!notesEntriesContainer.querySelector('.notes-entry-row')) return;
                    setNoteRowDeleteMode(!isNoteRowDeleteMode);
                });
            }
            if (saveNotesButton) {
                saveNotesButton.addEventListener('click', () => {
                    const saved = saveNotesToLocalStorage();
                    showSaveNotesFeedback(saved);
                });
            }
            if (resetBoardButton) {
                resetBoardButton.addEventListener('click', () => {
                    resetCurrentBoardToDefaults();
                });
            }
            if (askAiButton) {
                askAiButton.addEventListener('click', () => {
                    requestAiAnswer();
                });
            }
            if (changePromptButton) {
                changePromptButton.addEventListener('click', () => {
                    openPromptEditorPanel();
                });
            }
            if (cancelPromptEditButton) {
                cancelPromptEditButton.addEventListener('click', () => {
                    closePromptEditorPanel();
                });
            }
            if (savePromptTaskLinesButton) {
                savePromptTaskLinesButton.addEventListener('click', () => {
                    savePromptTaskLinesFromEditor();
                });
            }
            if (resetPromptTaskLinesButton) {
                resetPromptTaskLinesButton.addEventListener('click', () => {
                    resetPromptTaskLinesInEditor();
                });
            }
            if (promptEditorBackdrop) {
                promptEditorBackdrop.addEventListener('click', () => {
                    closePromptEditorPanel();
                });
            }
            if (referenceHelpBackdrop) {
                referenceHelpBackdrop.addEventListener('click', () => {
                    closeReferenceHelpPanel();
                });
            }
            document.addEventListener('pointerdown', () => {
                if (referenceHelpPanel && !referenceHelpPanel.classList.contains('is-hidden')) {
                    closeReferenceHelpPanel();
                }
            });
            if (openNotesLibraryButton && notesLibraryPanel) {
                openNotesLibraryButton.addEventListener('click', () => {
                    toggleNotesLibraryPanel();
                });
            }
            if (closeNotesLibraryButton && notesLibraryPanel) {
                closeNotesLibraryButton.addEventListener('click', () => {
                    closeNotesLibraryPanel();
                });
            }
            if (notesLibraryBackdrop) {
                notesLibraryBackdrop.addEventListener('click', () => {
                    closeNotesLibraryPanel();
                });
            }
            if (clearNotesLibraryButton) {
                clearNotesLibraryButton.addEventListener('click', () => {
                    if (!persistNotesLibraryToStorage([])) return;
                    activeEditingNoteId = null;
                    renderNotesLibraryList();
                });
            }
            document.addEventListener('mousedown', (event) => {
                if (event.target.closest('.notes-palace-picker')) return;
                closeAllNotePalaceSelectors();
                if (notesLibraryPanel && !notesLibraryPanel.classList.contains('is-hidden')) {
                    const clickedInsideLibrary = notesLibraryPanel.contains(event.target);
                    const clickedLibraryTrigger = openNotesLibraryButton?.contains(event.target);
                    if (!clickedInsideLibrary && !clickedLibraryTrigger) {
                        closeNotesLibraryPanel();
                    }
                }
                if (promptEditorPanel && !promptEditorPanel.classList.contains('is-hidden')) {
                    const clickedInsidePromptEditor = promptEditorPanel.contains(event.target);
                    const clickedPromptTrigger = changePromptButton?.contains(event.target);
                    if (!clickedInsidePromptEditor && !clickedPromptTrigger) {
                        closePromptEditorPanel();
                    }
                }
            });
            document.addEventListener('keydown', (event) => {
                if (event.key !== 'Escape') return;
                if (referenceHelpPanel && !referenceHelpPanel.classList.contains('is-hidden')) {
                    closeReferenceHelpPanel();
                }
            });
        }
        syncNotesPalaceDashStyle();
        window.addEventListener('resize', syncNotesPalaceDashStyle);
        initMainPanelCustomDropdowns();
        loadReferenceHelpDoc();
        bindMainPanelReferenceHelpInteraction();
        manualInput.addEventListener('pointerdown', () => {
            isPointerFocusingManualInput = true;
        });
        manualInput.addEventListener('focus', (event) => {
            const currentDate = parseDateTimeValue(event.target.value);
            if (!currentDate) {
                setDateTimeValue(toDateTimeLocalValue(new Date()));
            }
            if (isPointerFocusingManualInput) return;
            const idx = getSegmentIndexByPosition(event.target.selectionStart ?? 0);
            selectDateTimeSegment(event.target, idx);
        });
        manualInput.addEventListener('click', (event) => {
            window.requestAnimationFrame(() => {
                const idx = getSegmentIndexByPosition(event.target.selectionStart ?? 0);
                selectDateTimeSegment(event.target, idx);
                isPointerFocusingManualInput = false;
            });
        });
        function normalizeDigitKeyChar(value) {
            if (!value || typeof value !== 'string') return '';
            if (/^[0-9]$/.test(value)) return value;
            const code = value.charCodeAt(0);
            if (code >= 0xFF10 && code <= 0xFF19) {
                return String(code - 0xFF10);
            }
            return '';
        }
        function applySegmentDigitInput(input, digit) {
            const idx = getSegmentIndexByPosition(input.selectionStart || 0);
            const segment = dateTimeSegments[idx];
            if (!segment) return;
            if (activeSegmentIndex !== idx) {
                activeSegmentIndex = idx;
                segmentInputBuffer = '';
                const parts = getSegmentValuesFromInput(input.value);
                segmentPreviousValue = parts[segment.key] || '';
            }
            segmentInputBuffer = (segmentInputBuffer + digit).slice(0, segment.len);
            const parts = getSegmentValuesFromInput(input.value);
            const previewValue = (segmentInputBuffer + segmentPreviousValue.slice(segmentInputBuffer.length)).slice(0, segment.len);
            parts[segment.key] = previewValue;
            input.value = buildDateTimeTextFromParts(parts);
            input.setSelectionRange(segment.start, segment.end);
            validateManualDateTimeInput(input.value);
            if (segmentInputBuffer.length < segment.len) return;

            const candidate = segmentInputBuffer;
            if (!isSegmentValueValid(segment.key, candidate, { ...parts, [segment.key]: candidate })) {
                parts[segment.key] = segmentPreviousValue;
                input.value = buildDateTimeTextFromParts(parts);
                segmentInputBuffer = '';
                validateManualDateTimeInput(input.value, { report: true });
                selectDateTimeSegment(input, idx);
                return;
            }

            parts[segment.key] = candidate;
            if (segment.key !== 'day') {
                const maxDay = getDaysInMonth(Number(parts.year), Number(parts.month));
                if (Number(parts.day) > maxDay) {
                    parts.day = String(maxDay).padStart(2, '0');
                }
            }
            input.value = buildDateTimeTextFromParts(parts);
            validateManualDateTimeInput(input.value);
            applyManualInputDateTime(input.value);
            if (idx < dateTimeSegments.length - 1) {
                selectDateTimeSegment(input, idx + 1);
            } else {
                selectDateTimeSegment(input, idx);
            }
        }
        manualInput.addEventListener('beforeinput', (event) => {
            if (event.isComposing) return;
            const inputType = event.inputType || '';
            if (inputType === 'insertText' || inputType === 'insertCompositionText') {
                const text = typeof event.data === 'string' ? event.data : '';
                if (!text) return;
                const digits = Array.from(text).map(normalizeDigitKeyChar).filter(Boolean);
                if (!digits.length) {
                    event.preventDefault();
                    return;
                }
                event.preventDefault();
                digits.forEach((digit) => applySegmentDigitInput(manualInput, digit));
                return;
            }
            if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward') {
                event.preventDefault();
                segmentInputBuffer = '';
                const idx = getSegmentIndexByPosition(manualInput.selectionStart || 0);
                selectDateTimeSegment(manualInput, idx);
            }
        });
        manualInput.addEventListener('keydown', (event) => {
            const input = event.target;
            const key = event.key;
            const idx = getSegmentIndexByPosition(input.selectionStart || 0);

            if (key === 'ArrowLeft') {
                event.preventDefault();
                selectDateTimeSegment(input, idx - 1);
                return;
            }
            if (key === 'ArrowRight') {
                event.preventDefault();
                selectDateTimeSegment(input, idx + 1);
                return;
            }
            if (key === 'Tab') {
                event.preventDefault();
                selectDateTimeSegment(input, idx + (event.shiftKey ? -1 : 1));
                return;
            }
            if (key === 'Backspace' || key === 'Delete') {
                event.preventDefault();
                segmentInputBuffer = '';
                selectDateTimeSegment(input, idx);
                return;
            }
            if (event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;

            const digit = normalizeDigitKeyChar(key);
            if (!digit) {
                if (key.length === 1) event.preventDefault();
                return;
            }

            event.preventDefault();
            applySegmentDigitInput(input, digit);
        });
        manualInput.addEventListener('paste', (event) => {
            const text = (event.clipboardData || window.clipboardData).getData('text');
            const date = parseStrictManualDateTimeValue(text);
            if (!date) {
                event.preventDefault();
                validateManualDateTimeInput(text, { report: true });
                return;
            }
            event.preventDefault();
            const formatted = formatManualDateTimeValue(date);
            manualInput.value = formatted;
            applyManualInputDateTime(formatted);
            selectDateTimeSegment(manualInput, 0);
        });
        manualInput.addEventListener('change', (event) => {
            applyManualInputDateTime(event.target.value);
        });
        manualInput.addEventListener('blur', (event) => {
            isPointerFocusingManualInput = false;
            applyManualInputDateTime(event.target.value);
        });
        if (typeof flatpickr === 'function' && dateTimeCalendarInput) {
            const numericMonthNames = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
            const disableOutOfCurrentMonthDays = (instance) => {
                if (!instance || !instance.calendarContainer) return;
                const outOfMonthDays = instance.calendarContainer.querySelectorAll(
                    '.flatpickr-day.prevMonthDay, .flatpickr-day.nextMonthDay'
                );
                outOfMonthDays.forEach((dayEl) => {
                    dayEl.classList.add('flatpickr-disabled', 'is-out-of-current-month');
                    dayEl.setAttribute('aria-disabled', 'true');
                    dayEl.tabIndex = -1;
                });
            };
            const closeCustomSelectLists = (calendarContainer) => {
                closeOpenCustomSelects(calendarContainer);
            };
            const createCustomHeaderSelect = ({ className, options, onSelect }) => {
                return createCustomSelect({
                    rootClassName: className,
                    options,
                    onSelect,
                    emptyLabel: '',
                    centerSelectedOnOpen: true
                });
            };
            const ensureCustomMonthYearHeader = (instance) => {
                const monthHeader = instance.calendarContainer.querySelector('.flatpickr-current-month');
                if (!monthHeader) return;
                monthHeader.classList.add('calendar-header');
                instance.calendarContainer.classList.add('with-year-select');
                if (!monthHeader.querySelector('.dropdown-calendar-year')) {
                    const currentYear = new Date().getFullYear();
                    const yearOptions = [];
                    for (let year = 1900; year <= currentYear; year += 1) {
                        yearOptions.push({
                            value: String(year),
                            label: `${year}年`
                        });
                    }
                    const monthOptions = numericMonthNames.map((label, idx) => ({
                        value: String(idx),
                        label
                    }));
                    const yearSelect = createCustomHeaderSelect({
                        className: 'dropdown-calendar-year',
                        options: yearOptions,
                        onSelect: (selectedYear) => {
                            const numericYear = Number(selectedYear);
                            if (!Number.isFinite(numericYear)) return;
                            instance.changeYear(numericYear);
                        }
                    });
                    const monthSelect = createCustomHeaderSelect({
                        className: 'dropdown-calendar-month',
                        options: monthOptions,
                        onSelect: (selectedMonth) => {
                            const numericMonth = Number(selectedMonth);
                            if (!Number.isFinite(numericMonth)) return;
                            instance.changeMonth(numericMonth, false);
                        }
                    });
                    const headerCenter = document.createElement('div');
                    headerCenter.className = 'calendar-header-center';
                    headerCenter.appendChild(yearSelect.root);
                    headerCenter.appendChild(monthSelect.root);
                    monthHeader.prepend(headerCenter);
                    instance._fpCustomYearSelect = yearSelect;
                    instance._fpCustomMonthSelect = monthSelect;
                }
                if (!instance._fpCustomOutsideClickHandler) {
                    instance._fpCustomOutsideClickHandler = (event) => {
                        if (!instance.calendarContainer.contains(event.target)) return;
                        const monthHeaderInside = event.target.closest('.calendar-header');
                        if (monthHeaderInside) return;
                        closeCustomSelectLists(instance.calendarContainer);
                    };
                    instance.calendarContainer.addEventListener('mousedown', instance._fpCustomOutsideClickHandler);
                }
            };
            const syncCustomMonthYearHeader = (instance) => {
                if (instance._fpCustomYearSelect) {
                    instance._fpCustomYearSelect.setValue(String(instance.currentYear));
                }
                if (instance._fpCustomMonthSelect) {
                    instance._fpCustomMonthSelect.setValue(String(instance.currentMonth));
                }
            };
            chineseDatePicker = flatpickr(dateTimeCalendarInput, {
                locale: {
                    ...flatpickr.l10ns.zh,
                    months: {
                        shorthand: numericMonthNames,
                        longhand: numericMonthNames
                    }
                },
                disableMobile: true,
                enableTime: true,
                time_24hr: true,
                minuteIncrement: 1,
                dateFormat: 'Y/m/d H:i',
                prevArrow: '‹',
                nextArrow: '›',
                maxDate: new Date(),
                positionElement: manualInput,
                position: 'below left',
                defaultDate: parseDateTimeValue(manualInput.value) || new Date(),
                onReady: (_, __, instance) => {
                    ensureCustomMonthYearHeader(instance);
                    syncCustomMonthYearHeader(instance);
                    disableOutOfCurrentMonthDays(instance);
                    const timeInputs = instance.calendarContainer.querySelectorAll('.flatpickr-time input');
                    timeInputs.forEach((input) => {
                        const forceCaret = () => {
                            const applyCaret = () => {
                                if (document.activeElement !== input) return;
                                const len = input.value.length;
                                try {
                                    input.setSelectionRange(len, len);
                                } catch (_) {}
                            };
                            window.setTimeout(applyCaret, 0);
                            window.setTimeout(applyCaret, 16);
                        };
                        const wrapper = input.closest('.numInputWrapper');
                        if (wrapper) {
                            wrapper.addEventListener('mousedown', (event) => {
                                if (event.target && event.target.closest && event.target.closest('.arrowUp, .arrowDown')) {
                                    return;
                                }
                                event.preventDefault();
                                input.focus({ preventScroll: true });
                                forceCaret();
                            });
                        }
                        input.addEventListener('focus', forceCaret);
                        input.addEventListener('select', forceCaret);
                        input.addEventListener('mouseup', forceCaret);
                        input.addEventListener('click', forceCaret);
                        input.addEventListener('keyup', forceCaret);
                    });
                },
                onYearChange: (_, __, instance) => {
                    syncCustomMonthYearHeader(instance);
                    disableOutOfCurrentMonthDays(instance);
                },
                onMonthChange: (_, __, instance) => {
                    syncCustomMonthYearHeader(instance);
                    disableOutOfCurrentMonthDays(instance);
                },
                onDayCreate: (_, __, instance, dayElem) => {
                    if (!dayElem || !(dayElem instanceof HTMLElement)) return;
                    if (dayElem.classList.contains('prevMonthDay') || dayElem.classList.contains('nextMonthDay')) {
                        dayElem.classList.add('flatpickr-disabled', 'is-out-of-current-month');
                        dayElem.setAttribute('aria-disabled', 'true');
                        dayElem.tabIndex = -1;
                    }
                },
                onChange: (selectedDates, __, instance) => {
                    if (!selectedDates || !selectedDates.length) return;
                    const formatted = formatManualDateTimeValue(selectedDates[0]);
                    manualInput.value = formatted;
                    applyManualInputDateTime(formatted);
                    selectDateTimeSegment(manualInput, 0);
                    const activeEl = document.activeElement;
                    if (activeEl && activeEl.closest && activeEl.closest('.flatpickr-time')) {
                        activeEl.blur();
                    }
                    const selectedDay = instance.calendarContainer.querySelector('.flatpickr-day.selected');
                    if (selectedDay && typeof selectedDay.focus === 'function') {
                        selectedDay.focus({ preventScroll: true });
                    }
                },
                onOpen: (_, __, instance) => {
                    syncCustomMonthYearHeader(instance);
                    disableOutOfCurrentMonthDays(instance);
                    closeCustomSelectLists(instance.calendarContainer);
                    attachCalendarAutoPosition(instance);
                    window.requestAnimationFrame(() => {
                        positionCalendarCenteredBelowDateTimeRow(instance);
                    });
                    const activeTimeInput = instance.calendarContainer.querySelector('.flatpickr-time input:focus');
                    if (activeTimeInput) {
                        const len = activeTimeInput.value.length;
                        window.setTimeout(() => {
                            if (document.activeElement === activeTimeInput) {
                                activeTimeInput.setSelectionRange(len, len);
                            }
                        }, 0);
                    }
                },
                onClose: () => {
                    detachCalendarPositionListeners();
                }
            });
        }
        if (dateTimePickerButton) {
            dateTimePickerButton.addEventListener('click', () => {
                const currentDate =
                    parseDateTimeValue(manualInput.value) ||
                    parseDateTimeValue(document.getElementById('dateTime').value) ||
                    new Date();
                if (chineseDatePicker) {
                    chineseDatePicker.setDate(currentDate, false);
                    chineseDatePicker.open();
                }
            });
        }
        if (dateTimeNowButton) {
            dateTimeNowButton.addEventListener('click', () => {
                const now = new Date();
                setDateTimeValue(toDateTimeLocalValue(now));
                validateManualDateTimeInput(manualInput.value);
            });
        }
        const previousWindowOnload = window.onload;
        window.onload = (event) => {
            if (typeof previousWindowOnload === 'function') {
                previousWindowOnload.call(window, event);
            }
            syncNotesLibraryPanelTopWithButton();
            renderNotesLibraryList();
            clearCurrentPageNotesContent();
        };
        window.addEventListener('resize', syncNotesLibraryPanelTopWithButton);