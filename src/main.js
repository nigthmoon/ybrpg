/**
 * 星河之契 - 主入口
 * 按依赖顺序导入各模块（与原始 index.html script 加载顺序一致）
 */

// 1. 宝物定义（需在 gameData.js 之前）
import './equip.js';

// 2. 游戏数据管理
import './gameData.js';

// 3. UI 工具函数（toast/confirmDialog 等，需在 mode.js 之前）
import './ui/utils.js';

// 4. 游戏系统（宝物/战力计算等，需在 mode.js 之前）
import './game/system.js';

// 5. UI 和游戏逻辑
import './mode.js';

// 6. 角色列表
import './characterList.js';

// 7. 技能/内容列表
import './contentList.js';

// 8. 事件列表
import './eventList.js';

// 9. 突破配置
import './charBreakthroughConfig.js';

// 10. 战斗系统
import './battle/battle_refactored.js';

console.log('[星河之契] 所有模块加载完成');
