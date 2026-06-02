type battleState = {
    /**玩家队伍 */
    playerUnits:Set<object>,
    /**敌人队伍 */ 
    enemyUnits:Set<object>, 
    /**先手权 */
    firstSide:'player'|'enemy', 
    /**轮数 */
    round: number,
    /**当前回合序号 */
    currentTurnIndex: number, 
    /**当前该谁行动 */
    currentTurnSide: null, 
    /**当前阶段 */
    phase: 'intro'|'player_action'|'enemy_action'|'animating'|'ended',
	/**记录已行动角色 */
    actedSlots: { 
        /**玩家阵型 */
        player: Set<string>,
        /**敌人阵型 */ 
        enemy: Set<string>
    },
    /**未见调用 */
    selectedSkill: null, 
    /**选择目标（貌似仅有少处调用 */
    selectedTargets: [],
    /**当前事件难度 */
    difficulty?: 'normal'|'nightmare'|'hell',
    /**当前事件id */
    eventId: string|null,
    /**事件类型 */
    eventType?: 'battle'|'boss',
    /**当前事件所处章节 */
    chapterKey: string|null,
    /**战斗奖金倍率 */
    goldScale?: 1.0|number,
    /**敌人数量（） */
    enemyCount: number,
    /**战斗胜利执行函数 */
    onWin: Function| null,
    /**战斗失败执行函数 */
    onLose: Function| null,
    /**战斗记录 */
    log: [],
    /**旧代码，标记战斗开始宝物是否已触发 */
    battleStarted: boolean,
    /**战斗奖金 */
    expectedGold: number, 
}
/**
 * 角色组成的数组
 */
// type Players = [Object]