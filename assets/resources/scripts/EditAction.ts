import { _decorator, Component, Node, Prefab, UITransform, instantiate, Size, Input, EventTouch, Vec3, Vec2, Game, EventMouse } from 'cc';
import { EditCtlAction } from './EditCtlAction';
import { EventDispatcher } from './EventDispatcher';
import { GameState } from './GameState';
import { Layer1Action } from './Layer1Action';
const { ccclass, property } = _decorator;

/**
 * @description 编辑器 action
 * @author 毛山
 * @timestamp 2023-4-1
 */
@ccclass('EditAction')
export class EditAction extends Component {

    /**
     * 编辑器中，小黑格子预置体
     */
    @property({ type: Prefab })
    pre_grid: Prefab = null;

    /**
     * layer1 脚本
     */
    @property({ type: Layer1Action })
    layer_1_action: Layer1Action = null;


    cur_grid: Node = null;

    /**
     * 编辑器的控制面板脚本
     */
    @property({ type: EditCtlAction })
    edit_ctl_action: EditCtlAction = null;

    start() {
        this.start_edit();
    }

    update(deltaTime: number) {
    }

    /**
     * 初始化编辑器的格子,横向15，纵向17
     */
    private init_grid() {
        this.node.removeAllChildren();
        let start_x = this.node.getComponent(UITransform).width / 2 * -1 + 15;
        let start_y = this.node.getComponent(UITransform).height / 2 - 10;
        for (let i = 0; i < 10; i++) {
            let x = start_x + (57 * (i + 1));
            for (let j = 0; j < 11; j++) {
                let y = start_y + (57.5 * (j + 1) * -1);
                //add grid
                this.add_grid(x, y);
            }
        }
    }

    /**
     * 添加格子
     * @param x 
     * @param y 
     * @param size  根据size来设定格子大小，默认说20*20
     */
    add_grid(x: number, y: number, size?: Size) {
        //实例化 grid
        let grid = instantiate(this.pre_grid);
        grid.setPosition(x, y);
        grid.setParent(this.node);
        if (size) {
            grid.getComponent(UITransform).setContentSize(size);
        }
    }

    /**
     * 初始化脚本
     * 1，初始化基本的格子15*17个
     * 2，添加触控事件
     */
    start_edit() {
        this.init_grid();
        this.node.on(Input.EventType.TOUCH_START, this.touch_start, this);
        this.node.on(Input.EventType.TOUCH_MOVE, this.touch_move, this);
        this.node.on(Input.EventType.MOUSE_MOVE, this.mouse_move, this);
    }
    /**
     * touch move 事件
     * @param e 
     * @returns 
     */
    touch_move(e: EventTouch) {
        let wp = e.getUILocation();
        //把UI坐标系下的坐标， 转成本地坐标
        let local_pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(wp.x, wp.y));
        if (GameState.edit_model != 1) {
            return;
        }
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let grid = this.node.children[i];
            if (this.cur_grid == grid) {
                continue;
            }
            if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(local_pos.x, local_pos.y))) {
                this.cur_grid = grid;
                //往layer1中添加一个block，采用世界坐标方式
                this.layer_1_action.add_block_by_world_position(grid.getWorldPosition());
                //刷新遮挡关系
                this.layer_1_action.refresh_shadow();
                //跟新编辑器控制面板里的block size label
                EventDispatcher.get_target().emit(EventDispatcher.UPDATE_BLOCK_SIZE);
                break;
            }
        }
    }
    /**
     * touch start 方法
     * @param e 
     */
    touch_start(e: EventTouch) {
        let wp = e.getUILocation();
        //把UI坐标系下的坐标， 转成本地坐标
        let local_pos = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(wp.x, wp.y));
        //编辑模式分：1=添加block，2=删除block，3=添加grid，4=删除grid 
        switch (GameState.edit_model) {
            case 1://添加block
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    let grid = this.node.children[i];
                    if (this.cur_grid == grid) {
                        continue;
                    }
                    //根据包围盒子判断是否和local pos有包含关系
                    if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(local_pos.x, local_pos.y))) {
                        //
                        this.cur_grid = grid;
                        //往layer1中添加一个block，采用世界坐标方式
                        this.layer_1_action.add_block_by_world_position(grid.getWorldPosition());
                        //刷新遮挡关系
                        this.layer_1_action.refresh_shadow();
                        break;
                    }
                }
                EventDispatcher.get_target().emit(EventDispatcher.UPDATE_BLOCK_SIZE);
                break;
            case 2:// 删除block
                //往layer1中删除一个block，采用世界坐标方式
                this.layer_1_action.subtract_block(new Vec3(wp.x, wp.y));
                //刷新遮挡关系
                this.layer_1_action.refresh_shadow();
                EventDispatcher.get_target().emit(EventDispatcher.UPDATE_BLOCK_SIZE);
                break;
            case 3:
                //添加一个grid
                this.add_grid(local_pos.x, local_pos.y, new Size(10, 10));
                break;
            case 4:
                //删除grid
                for (let i = this.node.children.length - 1; i >= 0; i--) {
                    let grid = this.node.children[i];
                    //判断grid的包围盒是否包含触点坐标，来判断
                    if (grid.getComponent(UITransform).getBoundingBox().contains(new Vec2(local_pos.x, local_pos.y))) {
                        grid.removeFromParent();
                        break;
                    }
                }
                break;
        }
    }
    /**
     * 鼠标的移动，用于获取鼠标的坐在位置的坐标
     * @param e 
     */
    mouse_move(e: EventMouse) {
        let x = e.getUILocation().x;
        let y = e.getUILocation().y;
        let local = this.node.getComponent(UITransform).convertToNodeSpaceAR(new Vec3(x, y));
        this.edit_ctl_action.set_pos(Math.floor(local.x), Math.floor(local.y));
    }
}

