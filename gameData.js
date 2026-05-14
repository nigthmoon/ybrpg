/**
 * 夜白旅程 - 游戏数据管理类
 * 负责管理队伍、背包、副本、商店、图鉴等模块的数据
 */
class GameData {
    constructor() {
        // 存储键名
        this.STORAGE_KEY = 'ybrpg_save';
        this.SLOT_COUNT = 4; // 存档槽位数量
        
        // 初始化各模块数据
        this.data = this.getDefaultData();
    }

    /**
     * 获取默认数据
     */
    getDefaultData() {
        return {
            // ========== 基础信息 ==========
            baseInfo: {
                saveName: '新存档',
                saveTime: null,
                version: '1.0.0'
            },
            
            // ========== 队伍模块 ==========
            team: {
                members: [],           // 队伍成员角色ID数组
                maxMembers: 6,         // 最大队伍人数
                order: []              // 站位顺序
            },
            
            // ========== 背包模块 ==========
            bag: {
                items: {},             // {itemId: count} 物品数量
                gold: 0,               // 金币
                gems: 0                // 宝石
            },
            
            // ========== 副本模块 ==========
            dungeon: {
                currentChapter: 1,    // 当前章节
                currentStage: 0,      // 当前关卡索引
                unlockedChapters: [1],// 已解锁的章节
                completedStages: [],  // 已完成的关卡ID数组
                stageProgress: {}     // {stageId: {isCompleted, stars, bestScore}}
            },
            
            // ========== 商店模块 ==========
            shop: {
                refreshTime: null,     // 下次刷新时间
                items: [],             // 当前商店物品
                purchaseHistory: [],   // 购买记录
                totalSpent: 0          // 总消费
            },
            
            // ========== 图鉴模块 ==========
            handbook: {
                ownedCharacters: [],  // 已拥有的角色ID
                viewedCharacters: [],  // 已查看过的角色ID
                collectionProgress: {
                    total: 0,
                    owned: 0
                }
            }
        };
    }

    // ==================== 通用方法 ====================

    /**
     * 保存游戏数据到localStorage
     * @param {number} slotIndex 存档槽位索引 (0-3)
     */
    save(slotIndex = 0) {
        const key = `${this.STORAGE_KEY}_${slotIndex}`;
        this.data.baseInfo.saveTime = new Date().toISOString();

        // 同步 window 变量到 GameData
        if (window.currentTeam) {
            this.data.team.members = window.currentTeam.filter(Boolean);
        }
        if (window.gameGold !== undefined) {
            this.data.bag.gold = window.gameGold;
        }
        if (window.charBagData) {
            this.data._charBag = JSON.parse(JSON.stringify(window.charBagData));
        }
        if (window.treasureEquipData) {
            this.data._treasures = JSON.parse(JSON.stringify(window.treasureEquipData));
        }
        if (window.treasureBagData) {
            this.data._treasureBag = JSON.parse(JSON.stringify(window.treasureBagData));
        }
        if (window.playerProgress) {
            // 将 playerProgress 转换为 stageProgress 格式
            Object.entries(window.playerProgress).forEach(([eventId, completed]) => {
                if (completed && !this.data.dungeon.completedStages.includes(eventId)) {
                    this.data.dungeon.completedStages.push(eventId);
                    this.data.dungeon.stageProgress[eventId] = { isCompleted: true, stars: 3 };
                }
            });
        }

        localStorage.setItem(key, JSON.stringify(this.data));
        console.log(`[GameData] 已保存到槽位 ${slotIndex}`, this.data);
    }

    /**
     * 从localStorage读取存档
     * @param {number} slotIndex 存档槽位索引
     * @returns {Object} 存档数据
     */
    load(slotIndex = 0) {
        const key = `${this.STORAGE_KEY}_${slotIndex}`;
        const savedData = localStorage.getItem(key);
        if (savedData) {
            this.data = JSON.parse(savedData);
            console.log(`[GameData] 已加载槽位 ${slotIndex}`, this.data);
            return this.data;
        }
        return null;
    }

    /**
     * 获取所有存档槽位的信息摘要
     * @returns {Array} 存档信息列表
     */
    getAllSaveSlots() {
        const slots = [];
        for (let i = 0; i < this.SLOT_COUNT; i++) {
            const key = `${this.STORAGE_KEY}_${i}`;
            const savedData = localStorage.getItem(key);
            if (savedData) {
                const data = JSON.parse(savedData);
                slots.push({
                    index: i,
                    hasData: true,
                    saveName: data.baseInfo?.saveName || '存档' + (i + 1),
                    saveTime: data.baseInfo?.saveTime || null,
                    chapter: data.dungeon?.currentChapter || 1,
                    teamCount: data.team?.members?.length || 0
                });
            } else {
                slots.push({
                    index: i,
                    hasData: false,
                    saveName: '空存档',
                    saveTime: null
                });
            }
        }
        return slots;
    }

    /**
     * 删除指定槽位的存档
     * @param {number} slotIndex 
     */
    deleteSave(slotIndex) {
        const key = `${this.STORAGE_KEY}_${slotIndex}`;
        localStorage.removeItem(key);
        console.log(`[GameData] 已删除槽位 ${slotIndex}`);
    }

    /**
     * 重置所有数据为默认值
     */
    reset() {
        this.data = this.getDefaultData();
        console.log('[GameData] 数据已重置');
    }

    // ==================== 队伍模块 ====================

    /**
     * 获取队伍成员列表
     * @returns {Array} 角色ID数组
     */
    getTeamMembers() {
        return this.data.team.members || [];
    }

    /**
     * 添加角色到队伍
     * @param {string} characterId 角色ID
     * @returns {boolean} 是否成功
     */
    addToTeam(characterId) {
        if (this.data.team.members.length >= this.data.team.maxMembers) {
            console.warn('[Team] 队伍已满');
            return false;
        }
        if (this.data.team.members.includes(characterId)) {
            console.warn('[Team] 角色已在队伍中');
            return false;
        }
        this.data.team.members.push(characterId);
        // 如果没有设置顺序，也同步更新
        if (!this.data.team.order.length) {
            this.data.team.order = [...this.data.team.members];
        }
        console.log(`[Team] 已添加 ${characterId}`);
        return true;
    }

    /**
     * 从队伍移除角色
     * @param {string} characterId 
     * @returns {boolean}
     */
    removeFromTeam(characterId) {
        const index = this.data.team.members.indexOf(characterId);
        if (index > -1) {
            this.data.team.members.splice(index, 1);
            console.log(`[Team] 已移除 ${characterId}`);
            return true;
        }
        return false;
    }

    /**
     * 调整队伍顺序
     * @param {Array} newOrder 新的顺序数组
     */
    setTeamOrder(newOrder) {
        this.data.team.order = newOrder;
        console.log('[Team] 队伍顺序已更新');
    }

    // ==================== 背包模块 ====================

    /**
     * 获取背包物品
     * @returns {Object}
     */
    getInventory() {
        return this.data.bag.items || {};
    }

    /**
     * 添加物品到背包
     * @param {string} itemId 物品ID
     * @param {number} count 数量
     */
    addItem(itemId, count = 1) {
        if (!this.data.bag.items[itemId]) {
            this.data.bag.items[itemId] = 0;
        }
        this.data.bag.items[itemId] += count;
        console.log(`[Bag] 已添加 ${itemId} x${count}`);
    }

    /**
     * 从背包移除物品
     * @param {string} itemId 
     * @param {number} count 
     * @returns {boolean} 是否成功
     */
    removeItem(itemId, count = 1) {
        if (!this.data.bag.items[itemId] || this.data.bag.items[itemId] < count) {
            console.warn(`[Bag] 物品 ${itemId} 数量不足`);
            return false;
        }
        this.data.bag.items[itemId] -= count;
        if (this.data.bag.items[itemId] <= 0) {
            delete this.data.bag.items[itemId];
        }
        console.log(`[Bag] 已移除 ${itemId} x${count}`);
        return true;
    }

    /**
     * 获取物品数量
     * @param {string} itemId 
     * @returns {number}
     */
    getItemCount(itemId) {
        return this.data.bag.items[itemId] || 0;
    }

    /**
     * 获取金币
     */
    getGold() {
        return this.data.bag.gold || 0;
    }

    /**
     * 添加金币
     * @param {number} amount 
     */
    addGold(amount) {
        this.data.bag.gold += amount;
        console.log(`[Bag] 金币 +${amount}, 当前: ${this.data.bag.gold}`);
    }

    /**
     * 消耗金币
     * @param {number} amount 
     * @returns {boolean}
     */
    spendGold(amount) {
        if (this.data.bag.gold < amount) {
            console.warn('[Bag] 金币不足');
            return false;
        }
        this.data.bag.gold -= amount;
        console.log(`[Bag] 金币 -${amount}, 当前: ${this.data.bag.gold}`);
        return true;
    }

    // ==================== 副本模块 ====================

    /**
     * 获取当前进度
     */
    getDungeonProgress() {
        return {
            chapter: this.data.dungeon.currentChapter,
            stage: this.data.dungeon.currentStage
        };
    }

    /**
     * 完成关卡
     * @param {string} stageId 
     * @param {Object} result {stars, score}
     */
    completeStage(stageId, result = {}) {
        const { stars = 0, score = 0 } = result;
        
        if (!this.data.dungeon.stageProgress[stageId]) {
            this.data.dungeon.stageProgress[stageId] = {
                isCompleted: true,
                stars: stars,
                bestScore: score
            };
        } else {
            this.data.dungeon.stageProgress[stageId].isCompleted = true;
            this.data.dungeon.stageProgress[stageId].stars = Math.max(
                this.data.dungeon.stageProgress[stageId].stars,
                stars
            );
            this.data.dungeon.stageProgress[stageId].bestScore = Math.max(
                this.data.dungeon.stageProgress[stageId].bestScore,
                score
            );
        }
        
        // 记录完成
        if (!this.data.dungeon.completedStages.includes(stageId)) {
            this.data.dungeon.completedStages.push(stageId);
        }
        
        console.log(`[Dungeon] 已完成 ${stageId}, 星级: ${stars}`);
    }

    /**
     * 解锁章节
     * @param {number} chapter 
     */
    unlockChapter(chapter) {
        if (!this.data.dungeon.unlockedChapters.includes(chapter)) {
            this.data.dungeon.unlockedChapters.push(chapter);
            console.log(`[Dungeon] 已解锁第${chapter}章`);
        }
    }

    /**
     * 检查关卡是否已完成
     * @param {string} stageId 
     * @returns {boolean}
     */
    isStageCompleted(stageId) {
        return this.data.dungeon.completedStages.includes(stageId);
    }

    // ==================== 商店模块 ====================

    /**
     * 获取商店物品
     */
    getShopItems() {
        return this.data.shop.items || [];
    }

    /**
     * 设置商店物品
     * @param {Array} items 
     */
    setShopItems(items) {
        this.data.shop.items = items;
    }

    /**
     * 记录购买
     * @param {string} itemId 
     * @param {number} price 
     */
    recordPurchase(itemId, price) {
        this.data.shop.purchaseHistory.push({
            itemId,
            price,
            time: new Date().toISOString()
        });
        this.data.shop.totalSpent += price;
    }

    // ==================== 图鉴模块 ====================

    /**
     * 获取已拥有的角色列表
     */
    getOwnedCharacters() {
        return this.data.handbook.ownedCharacters || [];
    }

    /**
     * 添加角色到图鉴
     * @param {string} characterId 
     */
    addToHandbook(characterId) {
        const list = this.data.handbook.ownedCharacters;
        if (!list.includes(characterId)) {
            list.push(characterId);
            this.updateCollectionProgress();
            console.log(`[Handbook] 已收录 ${characterId}`);
        }
    }

    /**
     * 检查角色是否已收录
     * @param {string} characterId 
     * @returns {boolean}
     */
    isCharacterOwned(characterId) {
        return this.data.handbook.ownedCharacters.includes(characterId);
    }

    /**
     * 标记角色已查看
     * @param {string} characterId 
     */
    viewCharacter(characterId) {
        if (!this.data.handbook.viewedCharacters.includes(characterId)) {
            this.data.handbook.viewedCharacters.push(characterId);
        }
    }

    /**
     * 更新收集进度
     */
    updateCollectionProgress() {
        const total = Object.keys(characterList || {}).length;
        const owned = this.data.handbook.ownedCharacters.length;
        this.data.handbook.collectionProgress = { total, owned };
    }

    // ==================== 宝物模块 ====================

    /**
     * 宝物定义列表（数据来源于 treasureList.js 中的 TREASURE_DEFS）
     * 详见 treasureList.js 头部注释
     */
    getTreasureList() {
        return TREASURE_DEFS;
    }

    /**
     * 获取角色的宝物装备数据
     * @param {string} charId 角色ID
     * @returns {Array} 6个槽位的宝物ID数组（null表示空槽）
     */
    // getCharTreasures(charId) {
    //     if (!this.data._treasures) this.data._treasures = {};
    //     if (!this.data._treasures[charId]) {
    //         this.data._treasures[charId] = [null, null, null, null, null, null];
    //     }
    //     return this.data._treasures[charId];
    // }
    getCharTreasures(instanceId) {
        if (!this.data._treasures) this.data._treasures = {};
        if (!this.data._treasures[instanceId]) {
            this.data._treasures[instanceId] = [null, null, null, null, null, null];
        }
        return this.data._treasures[instanceId];
    }
    
    /**
     * 为角色装备宝物
     * @param {string} charId 角色ID
     * @param {number} slotIndex 宝物槽位 (0-5)
     * @param {string|null} treasureId 宝物ID，null表示卸下
     */
    // equipTreasure(charId, slotIndex, treasureId) {
    //     const treasures = this.getCharTreasures(charId);
    //     treasures[slotIndex] = treasureId;
    //     console.log(`[Treasure] ${charId} 槽位${slotIndex} ${treasureId ? '装备' + treasureId : '卸下'}`);
    // }
    equipTreasure(instanceId, slotIndex, treasureId) {
        const treasures = this.getCharTreasures(instanceId);
        treasures[slotIndex] = treasureId;
        console.log(`[Treasure] ${instanceId} 槽位${slotIndex} ${treasureId ? '装备' + treasureId : '卸下'}`);
    }
    

    /**
     * 获取所有已拥有的宝物及其装备状态
     * @returns {Object} { treasureId: { count, equippedBy: [charId, ...] } }
     */
    getTreasureInventory() {
        if (!this.data._treasureBag) this.data._treasureBag = {};
        return this.data._treasureBag;
    }

    /**
     * 添加宝物到背包
     * @param {string} treasureId 宝物ID
     * @param {number} count 数量
     */
    addTreasure(treasureId, count = 1) {
        if (!this.data._treasureBag) this.data._treasureBag = {};
        if (!this.data._treasureBag[treasureId]) {
            this.data._treasureBag[treasureId] = { count: 0, equippedBy: [] };
        }
        this.data._treasureBag[treasureId].count += count;
        console.log(`[TreasureBag] 已添加 ${treasureId} x${count}`);
    }

    /**
     * 从背包移除宝物
     * @param {string} treasureId 宝物ID
     * @param {number} count 数量
     */
    removeTreasure(treasureId, count = 1) {
        if (!this.data._treasureBag || !this.data._treasureBag[treasureId]) return;
        this.data._treasureBag[treasureId].count -= count;
        if (this.data._treasureBag[treasureId].count <= 0) {
            delete this.data._treasureBag[treasureId];
        }
        console.log(`[TreasureBag] 已移除 ${treasureId} x${count}`);
    }

    /**
     * 检查宝物是否可装备（有未装备的数量）
     * @param {string} treasureId 宝物ID
     * @returns {boolean}
     */
    canEquipTreasure(treasureId) {
        const bag = this.getTreasureInventory();
        if (!bag[treasureId]) return false;
        const equippedCount = bag[treasureId].equippedBy ? bag[treasureId].equippedBy.length : 0;
        return bag[treasureId].count > equippedCount;
    }

    /**
     * 卸下角色的所有宝物（角色离队时调用）
     * @param {string} charId 角色ID
     */
    unequipAllTreasures(charId) {
        const treasures = this.getCharTreasures(charId);
        for (let i = 0; i < treasures.length; i++) {
            treasures[i] = null;
        }
        console.log(`[Treasure] ${charId} 已卸下所有宝物`);
    }

    /**
     * 将源角色的宝物转移给目标角色，然后清空源角色的宝物
     * @param {string} fromCharId 源角色ID（被换下的角色）
     * @param {string} toCharId 目标角色ID（换上来的角色）
     */
    transferTreasures(fromCharId, toCharId) {
        const fromTreasures = this.getCharTreasures(fromCharId);
        const toTreasures = this.getCharTreasures(toCharId);
        for (let i = 0; i < fromTreasures.length; i++) {
            toTreasures[i] = fromTreasures[i];
            fromTreasures[i] = null;
        }
        console.log(`[Treasure] ${fromCharId} 的宝物已转移给 ${toCharId}`);
    }

    // ==================== 数据导出/导入 ====================

    /**
     * 导出存档数据（用于云同步等）
     * @returns {string}
     */
    exportSave() {
        return btoa(JSON.stringify(this.data));
    }

    /**
     * 导入存档数据
     * @param {string} encodedData 
     */
    importSave(encodedData) {
        try {
            this.data = JSON.parse(atob(encodedData));
            console.log('[GameData] 存档已导入');
            return true;
        } catch (e) {
            console.error('[GameData] 导入失败:', e);
            return false;
        }
    }
}

// 创建全局实例（兼容非模块环境）
const gameData = new GameData();
