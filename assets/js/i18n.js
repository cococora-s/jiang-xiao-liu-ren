        /* 江氏小六壬排盘器 — 语言包与切换 */
        (function initAppI18n(global) {
            const STORAGE_KEY = 'jiangshi_xiaoliuren_lang_v1';
            const SUPPORTED_LANGS = ['zh', 'en'];
            const listeners = [];

            const STRINGS = {
                zh: {
                    'app.title': '江氏小六壬排盘器',
                    'meta.description': '江氏小六壬排盘器：日时起卦、数字起卦、术语解释、AI 解卦与本地笔记。',
                    'header.devLog': '开发日志',
                    'header.notes': '我的笔记',
                    'header.lang': '语言',
                    'clock.lunarLoading': '获取农历中...',
                    'settings.method': '起卦方法',
                    'settings.queryItem': '求测事项',
                    'settings.datetime': '选择时间',
                    'settings.now': '当前时间',
                    'settings.number': '选择数字',
                    'settings.numberPlaceholder': '请输入任意数字',
                    'settings.randomNumber': '随机数字',
                    'settings.question': '具体问题',
                    'settings.questionPlaceholder': '(选填)',
                    'action.cast': '开始排盘',
                    'notes.title': '断卦笔记',
                    'notes.editPrompt': '修改AI提示词',
                    'notes.specifyPalace': '指定解读宫位',
                    'notes.askAi': '问AI',
                    'notes.save': '保存笔记',
                    'notes.update': '更新笔记',
                    'notes.saved': '已保存',
                    'notes.saveFailed': '保存失败',
                    'notes.reset': '重置盘面',
                    'notes.placeholder': '请输入笔记内容',
                    'notes.noPalace': '不填',
                    'notes.delete': '删除',
                    'library.title': '我的笔记',
                    'library.clear': '清空所有笔记',
                    'library.close': '关闭',
                    'library.empty': '暂无笔记',
                    'library.unknownTime': '未知时间',
                    'library.noQueryItem': '未填写事项',
                    'library.noQuestion': '未填写具体问题',
                    'specify.hint': '请手动指定AI解读宫位（默认为AI自动选择）',
                    'prompt.title': 'AI提示词',
                    'prompt.reset': '恢复默认',
                    'prompt.cancel': '取消',
                    'prompt.save': '保存',
                    'prompt.aria': '修改AI提示词',
                    'help.title': '术语解释',
                    'help.aria': '术语解释',
                    'help.empty': '暂无解释内容。',
                    'help.liuqinFlow': '六亲生克逻辑',
                    'help.liuhe': '六合',
                    'help.sanhe': '三合',
                    'devLog.title': '开发日志',
                    'devLog.aria': '开发日志',
                    'devLog.date': '日期',
                    'devLog.description': '说明',
                    'devLog.empty': '暂无开发日志',
                    'datetime.invalid': '请输入有效时间，格式为 yyyy/mm/dd HH:mm',
                    'alert.invalidNumber': '请输入有效数字（正整数）后再排盘。',
                    'alert.needBoard': '当前还没有排盘盘面，请先点击“开始排盘”后再问AI。',
                    'alert.needQuestion': '请先填写“求测事项”或“具体问题”后再问AI。',
                    'alert.needTaskLine': '请至少保留一条 #Task 步骤。',
                    'alert.aiFailed': '问AI失败：{message}',
                    'alert.unknownError': '未知错误',
                    'ai.requestFailed': 'AI 请求失败',
                    'ai.emptyReply': 'AI 返回为空，请稍后重试',
                    'ai.thinking': '思考中',
                    'ai.unfilled': '未填写',
                    'queryItem.吉凶': '吉凶',
                    'queryItem.寻物': '寻物',
                    'queryItem.感情': '感情',
                    'queryItem.考试': '考试',
                    'queryItem.事业': '事业',
                    'queryItem.财运': '财运',
                    'queryItem.健康': '健康',
                    'method.日时起卦': '日时起卦',
                    'method.数字起卦': '数字起卦',
                    'refField.number': '数字',
                    'refField.element': '五行',
                    'refField.orientation': '吉凶',
                    'refField.meaning': '主意',
                    'refField.timing': '应期',
                    'refField.character': '人物',
                    'refField.location': '方位地点',
                    'refField.imagery': '类象',
                    'refField.disease': '病象',
                    'refField.relation': '关系',
                    'refField.function': '功能',
                    'refField.objects': '对应对象',
                    'refField.focus': '核心关注',
                    'refField.positive': '正向',
                    'refField.negative': '负向',
                    'refField.style': '风格',
                    'refField.energy': '阶段',
                    'refField.industry': '行业',
                    'refField.key_factor': '关键点',
                    'refField.direction': '方向',
                    'refField.color': '颜色',
                    'refField.weather': '天气',
                    'refField.position': '位置',
                    'refField.occupation': '职业',
                    'refField.type': '属性',
                    'zhi.liuhe.子丑': '子丑（合化土）',
                    'zhi.liuhe.寅亥': '寅亥（合化木）',
                    'zhi.liuhe.卯戌': '卯戌（合化火）',
                    'zhi.liuhe.辰酉': '辰酉（合化金）',
                    'zhi.liuhe.巳申': '巳申（合化水）',
                    'zhi.liuhe.午未': '午未（合化土）',
                    'zhi.sanhe.申子辰': '申子辰（合水局）',
                    'zhi.sanhe.亥卯未': '亥卯未（合木局）',
                    'zhi.sanhe.寅午戌': '寅午戌（合火局）',
                    'zhi.sanhe.巳酉丑': '巳酉丑（合金局）',
                    'ai.defaultTask.1': '以用神所在宫为核心，同时兼顾身宫和对宫。',
                    'ai.defaultTask.2': '研判六宫、地支、六亲、六神、五星的五行生克旺衰。',
                    'ai.defaultTask.3': '提取对应意象（方位、意象、职业等）关联【具体问题】。'
                },
                en: {
                    'app.title': '江氏小六壬排盘器',
                    'meta.description': 'Jiang Xiao Liu Ren charting tool: date-time and number casting, term glossary, AI reading, and local notes.',
                    'header.devLog': 'DevLog',
                    'header.notes': 'My Notes',
                    'header.lang': 'Language',
                    'clock.lunarLoading': 'Loading lunar date...',
                    'settings.method': 'Method',
                    'settings.queryItem': 'Topic',
                    'settings.datetime': 'Time',
                    'settings.now': 'Now',
                    'settings.number': 'Number',
                    'settings.numberPlaceholder': 'Enter any number',
                    'settings.randomNumber': 'Random',
                    'settings.question': 'Question',
                    'settings.questionPlaceholder': '(optional)',
                    'action.cast': 'Cast Chart',
                    'notes.title': 'Reading Notes',
                    'notes.editPrompt': 'Edit Prompt',
                    'notes.specifyPalace': 'Palaces',
                    'notes.askAi': 'Ask AI',
                    'notes.save': 'Save Note',
                    'notes.update': 'Update Note',
                    'notes.saved': 'Saved',
                    'notes.saveFailed': 'Save failed',
                    'notes.reset': 'Reset Chart',
                    'notes.placeholder': 'Write your note',
                    'notes.noPalace': 'None',
                    'notes.delete': 'Delete',
                    'library.title': 'My Notes',
                    'library.clear': 'Clear All',
                    'library.close': 'Close',
                    'library.empty': 'No notes yet',
                    'library.unknownTime': 'Unknown time',
                    'library.noQueryItem': 'No topic',
                    'library.noQuestion': 'No question',
                    'specify.hint': 'Tap palaces to read (AI picks if none)',
                    'prompt.title': 'AI Prompt',
                    'prompt.reset': 'Default',
                    'prompt.cancel': 'Cancel',
                    'prompt.save': 'Save',
                    'prompt.aria': 'Edit AI prompt',
                    'help.title': 'Glossary',
                    'help.aria': 'Glossary',
                    'help.empty': 'No explanation yet.',
                    'help.liuqinFlow': 'Six Relatives Cycle',
                    'help.liuhe': 'Liu He',
                    'help.sanhe': 'San He',
                    'devLog.title': 'devLog',
                    'devLog.aria': 'devLog',
                    'devLog.date': 'Date',
                    'devLog.description': 'Notes',
                    'devLog.empty': 'No devLog yet',
                    'datetime.invalid': 'Enter a valid time as yyyy/mm/dd HH:mm',
                    'alert.invalidNumber': 'Enter a valid positive integer before casting.',
                    'alert.needBoard': 'Cast a chart first, then ask AI.',
                    'alert.needQuestion': 'Fill in a topic or question before asking AI.',
                    'alert.needTaskLine': 'Keep at least one #Task step.',
                    'alert.aiFailed': 'Ask AI failed: {message}',
                    'alert.unknownError': 'Unknown error',
                    'ai.requestFailed': 'AI request failed',
                    'ai.emptyReply': 'AI returned an empty reply. Please try again.',
                    'ai.thinking': 'Thinking',
                    'ai.unfilled': 'Not filled',
                    'queryItem.吉凶': 'Fortune',
                    'queryItem.寻物': 'Lost Item',
                    'queryItem.感情': 'Relationship',
                    'queryItem.考试': 'Exam',
                    'queryItem.事业': 'Career',
                    'queryItem.财运': 'Wealth',
                    'queryItem.健康': 'Health',
                    'method.日时起卦': 'Date/Time',
                    'method.数字起卦': 'By Number',
                    'refField.number': 'Numbers',
                    'refField.element': 'Wu Xing',
                    'refField.orientation': 'Outlook',
                    'refField.meaning': 'Theme',
                    'refField.timing': 'Timing',
                    'refField.character': 'People',
                    'refField.location': 'Place',
                    'refField.imagery': 'Imagery',
                    'refField.disease': 'Body / Illness',
                    'refField.relation': 'Relation',
                    'refField.function': 'Function',
                    'refField.objects': 'Correspondences',
                    'refField.focus': 'Focus',
                    'refField.positive': 'Upright',
                    'refField.negative': 'Shadow',
                    'refField.style': 'Style',
                    'refField.energy': 'Phase',
                    'refField.industry': 'Fields',
                    'refField.key_factor': 'Key Point',
                    'refField.direction': 'Direction',
                    'refField.color': 'Color',
                    'refField.weather': 'Weather',
                    'refField.position': 'Position',
                    'refField.occupation': 'Occupation',
                    'refField.type': 'Tone',
                    'zhi.liuhe.子丑': '子丑 (combine into Earth)',
                    'zhi.liuhe.寅亥': '寅亥 (combine into Wood)',
                    'zhi.liuhe.卯戌': '卯戌 (combine into Fire)',
                    'zhi.liuhe.辰酉': '辰酉 (combine into Metal)',
                    'zhi.liuhe.巳申': '巳申 (combine into Water)',
                    'zhi.liuhe.午未': '午未 (combine into Earth)',
                    'zhi.sanhe.申子辰': '申子辰 (Water trine)',
                    'zhi.sanhe.亥卯未': '亥卯未 (Wood trine)',
                    'zhi.sanhe.寅午戌': '寅午戌 (Fire trine)',
                    'zhi.sanhe.巳酉丑': '巳酉丑 (Metal trine)',
                    'ai.defaultTask.1': 'Focus on the yong-shen palace, while also weighing the body palace and the opposite palace.',
                    'ai.defaultTask.2': 'Judge generation, control, and strength among the six palaces, earthly branches, six relatives, six spirits, and five stars.',
                    'ai.defaultTask.3': 'Extract images (direction, imagery, vocation, etc.) and relate them to the specific question.'
                }
            };

            const TERMS = {
                zh: {},
                en: {
                    '木': 'Wood',
                    '火': 'Fire',
                    '土': 'Earth',
                    '金': 'Metal',
                    '水': 'Water',
                    '空': 'Void',
                    '木星': 'Wood',
                    '火星': 'Fire',
                    '土星': 'Earth',
                    '金星': 'Metal',
                    '水星': 'Water',
                    '天空': 'Void',
                    '父母': 'Parents',
                    '兄弟': 'Sibling',
                    '子孙': 'Child',
                    '妻财': 'Wealth',
                    '官鬼': 'Officer',
                    '身宫': 'Self',
                    '吉': 'Auspicious',
                    '凶': 'Inauspicious',
                    '大吉': 'Great Fortune',
                    '大凶': 'Great Misfortune',
                    '中性': 'Neutral',
                    '子': 'Zi',
                    '丑': 'Chou',
                    '寅': 'Yin',
                    '卯': 'Mao',
                    '辰': 'Chen',
                    '巳': 'Si',
                    '午': 'Wu',
                    '未': 'Wei',
                    '申': 'Shen',
                    '酉': 'You',
                    '戌': 'Xu',
                    '亥': 'Hai'
                }
            };

            const PALACE_NAME_ALIASES = {
                '大安': 0,
                '留连': 1,
                '速喜': 2,
                '赤口': 3,
                '小吉': 4,
                '空亡': 5,
                'Da An': 0,
                'Liu Lian': 1,
                'Su Xi': 2,
                'Chi Kou': 3,
                'Xiao Ji': 4,
                'Kong Wang': 5
            };

            let currentLang = 'zh';

            function normalizeLang(value) {
                const raw = String(value || '').trim().toLowerCase();
                if (raw === 'en' || raw.startsWith('en-')) return 'en';
                if (raw === 'zh' || raw.startsWith('zh')) return 'zh';
                return '';
            }

            function detectLang() {
                try {
                    const fromQuery = normalizeLang(new URLSearchParams(global.location.search).get('lang'));
                    if (fromQuery) return fromQuery;
                } catch (_) {}
                try {
                    const stored = normalizeLang(global.localStorage.getItem(STORAGE_KEY));
                    if (stored) return stored;
                } catch (_) {}
                try {
                    const fromBrowser = normalizeLang(global.navigator.language || global.navigator.userLanguage);
                    if (fromBrowser) return fromBrowser;
                } catch (_) {}
                return 'zh';
            }

            function t(key, vars) {
                const table = STRINGS[currentLang] || STRINGS.zh;
                let text = table[key] || STRINGS.zh[key] || key;
                if (vars && typeof vars === 'object') {
                    Object.entries(vars).forEach(([name, value]) => {
                        text = text.replaceAll(`{${name}}`, String(value ?? ''));
                    });
                }
                return text;
            }

            function tTerm(term) {
                const canonical = String(term || '').trim();
                if (!canonical) return '';
                const table = TERMS[currentLang] || {};
                return table[canonical] || canonical;
            }

            function formatTermTitle(term) {
                const canonical = String(term || '').trim();
                if (!canonical) return '';
                if (currentLang === 'zh') return canonical;
                const localized = tTerm(canonical);
                return localized && localized !== canonical ? `${localized} ${canonical}` : canonical;
            }

            function getLang() {
                return currentLang;
            }

            function getHtmlLang() {
                return 'zh-CN';
            }

            function applyStaticDom(root) {
                const scope = root || document;
                scope.querySelectorAll('[data-i18n]').forEach((el) => {
                    const key = el.getAttribute('data-i18n');
                    if (!key) return;
                    el.textContent = t(key);
                });
                scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                    const key = el.getAttribute('data-i18n-placeholder');
                    if (!key) return;
                    el.setAttribute('placeholder', t(key));
                });
                scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
                    const key = el.getAttribute('data-i18n-aria');
                    if (!key) return;
                    el.setAttribute('aria-label', t(key));
                });
                const titleEl = document.querySelector('title');
                if (titleEl) titleEl.textContent = t('app.title');
                const descEl = document.querySelector('meta[name="description"]');
                if (descEl) descEl.setAttribute('content', t('meta.description'));
                document.documentElement.lang = getHtmlLang();
                document.documentElement.setAttribute('data-ui-lang', currentLang);
                document.querySelectorAll('[data-lang]').forEach((button) => {
                    button.classList.toggle('is-active', button.getAttribute('data-lang') === currentLang);
                });
            }

            function persistLang(lang) {
                try {
                    global.localStorage.setItem(STORAGE_KEY, lang);
                } catch (_) {}
                try {
                    const url = new URL(global.location.href);
                    url.searchParams.set('lang', lang);
                    global.history.replaceState({}, '', url);
                } catch (_) {}
            }

            function setLang(nextLang, options) {
                const lang = normalizeLang(nextLang) || 'zh';
                const silent = Boolean(options && options.silent);
                const changed = lang !== currentLang;
                currentLang = lang;
                persistLang(lang);
                applyStaticDom();
                if (!silent && changed) {
                    listeners.forEach((fn) => {
                        try { fn(lang); } catch (error) { console.warn('i18n listener failed:', error); }
                    });
                }
                return lang;
            }

            function onLangChange(fn) {
                if (typeof fn === 'function') listeners.push(fn);
            }

            function getPalaceIndexByName(name) {
                const raw = String(name || '').trim();
                if (!raw) return null;
                if (Object.prototype.hasOwnProperty.call(PALACE_NAME_ALIASES, raw)) {
                    return PALACE_NAME_ALIASES[raw];
                }
                const folded = raw.replace(/\s+/g, ' ');
                if (Object.prototype.hasOwnProperty.call(PALACE_NAME_ALIASES, folded)) {
                    return PALACE_NAME_ALIASES[folded];
                }
                return null;
            }

            function canonicalFromDisplay(text) {
                const raw = String(text || '').trim();
                if (!raw) return '';
                if (Object.prototype.hasOwnProperty.call(TERMS.en, raw)) return raw;
                const counts = {};
                Object.values(TERMS.en).forEach((label) => {
                    counts[label] = (counts[label] || 0) + 1;
                });
                const uniqueReverse = {};
                Object.entries(TERMS.en).forEach(([zh, label]) => {
                    if (counts[label] === 1) uniqueReverse[label] = zh;
                });
                if (Object.prototype.hasOwnProperty.call(uniqueReverse, raw)) {
                    return uniqueReverse[raw];
                }
                return raw;
            }

            function getQueryItemLabel(value) {
                const key = `queryItem.${value}`;
                const translated = t(key);
                return translated === key ? value : translated;
            }

            function getMethodLabel(value) {
                const key = `method.${value}`;
                const translated = t(key);
                return translated === key ? value : translated;
            }

            function formatCalendarYear(year) {
                return currentLang === 'en' ? String(year) : `${year}年`;
            }

            function getCalendarMonthNames() {
                if (currentLang === 'en') {
                    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                }
                return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
            }

            function formatSolarDateTime(date) {
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hh = String(date.getHours()).padStart(2, '0');
                const mm = String(date.getMinutes()).padStart(2, '0');
                const ss = String(date.getSeconds()).padStart(2, '0');
                if (currentLang === 'en') {
                    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${hh}:${mm}:${ss}`;
                }
                return `${year}年${month}月${day}日 ${hh}:${mm}:${ss}`;
            }

            function formatLunarDateTime(lunar) {
                return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}时 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
            }

            function getListJoin() {
                return currentLang === 'en' ? ', ' : '、';
            }

            function getDataPath(kind) {
                if (kind === 'explanation') {
                    return currentLang === 'en' ? 'data/explanation.en.json' : 'data/explanation.json';
                }
                if (kind === 'changelog') {
                    return 'data/changelog.json';
                }
                if (kind === 'aiPrompt') {
                    return currentLang === 'en' ? '/data/ai-prompt.en.txt' : '/data/ai-prompt.txt';
                }
                return '';
            }

            currentLang = detectLang();
            persistLang(currentLang);
            document.addEventListener('click', (event) => {
                const button = event.target.closest('[data-lang]');
                if (!button || !button.closest('.lang-switch')) return;
                event.preventDefault();
                setLang(button.getAttribute('data-lang'));
            });
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => applyStaticDom(), { once: true });
            } else {
                applyStaticDom();
            }

            global.AppI18n = {
                STORAGE_KEY,
                SUPPORTED_LANGS,
                PALACE_NAME_ALIASES,
                t,
                tTerm,
                formatTermTitle,
                getLang,
                setLang,
                onLangChange,
                applyStaticDom,
                canonicalFromDisplay,
                getPalaceIndexByName,
                getQueryItemLabel,
                getMethodLabel,
                formatCalendarYear,
                getCalendarMonthNames,
                formatSolarDateTime,
                formatLunarDateTime,
                getListJoin,
                getDataPath
            };
        })(window);
