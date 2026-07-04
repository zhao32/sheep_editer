import { _decorator, Component, Node, Game } from 'cc';
const { ccclass, property } = _decorator;
/**
 * @description 用于存放游戏各种状态，游戏关卡数据等
 * @author 毛山
 * @timestamp 2023-4-1
 */
export class GameState {

    //标记，编辑模式中的4中模式
    public static edit_model: number = 1;//1=add block,2=del block ,3=add grid,4= del grid
}

