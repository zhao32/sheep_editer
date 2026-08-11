import { _decorator, Component, Node, Label, Button, EditBox, EventTouch, Color, Vec3, Size, color } from 'cc';
import { EditAction } from './EditAction';
import { EventDispatcher } from './EventDispatcher';
import { GameState } from './GameState';
import { Layer1Action } from './Layer1Action';
const { ccclass, property } = _decorator;
/**
 * @description 编辑器控制面板 action
 * @author 毛山
 * @timestamp 2023-4-1
 */
@ccclass('EditCtlAction')
export class EditCtlAction extends Component {
    // 用于显示 模式的
    @property({ type: Label })
    label_model_value: Label = null;
    // 用于显示 有多少block
    @property({ type: Label })
    label_block_size: Label = null;
    // 用于显示 鼠标的位置
    @property({ type: Label })
    label_position: Label = null;
    // 用于消息提示
    @property({ type: Label })
    label_msg: Label = null;
    // 用于输入的 x 坐标
    @property({ type: EditBox })
    position_x: EditBox = null;
    // 用于输入的y坐标
    @property({ type: EditBox })
    position_y: EditBox = null;
    // 用于导入导出的 EditBox
    @property({ type: EditBox })
    position_data: EditBox = null;
    // layer1脚本
    @property({ type: Layer1Action })
    layer_1_action: Layer1Action = null;

    start() {
        // 刷新当前的编辑模式，1，2，3，4
        this.refush_model();
        EventDispatcher.get_target().on(EventDispatcher.UPDATE_BLOCK_SIZE, this.update_block_size, this);
    }

    /**
     * 刷新模式
     * 1= 添加block，2=删除block，3=添加grid，4=删除grid
     */
    refush_model() {
        switch (GameState.edit_model) {
            case 1:
                this.label_model_value.string = "add block";
                break;
            case 2:
                this.label_model_value.string = "del block";
                break;
            case 3:
                this.label_model_value.string = "add grid";
                break;
            case 4:
                this.label_model_value.string = "del grid";
                break;
        }

    }

    /**
     * 修改模式，根据传入的参数args（1，2，3，4）
     * @param e 
     * @param args 
     */
    click_model(e: EventTouch, args: string) {
        GameState.edit_model = Number(args);
        this.refush_model();
    }

    update(deltaTime: number) {

    }

    /**
     * 导入
     * @returns 
     */
    click_import() {
        //获取数据从editbox中
        let data = this.position_data.string;
        if (data.trim().length < 5) {
            this.label_msg.string = "data is  null";
            return;
        }
        //清理场景中的block
        this.click_clear_all();
        //把字符串转换成对象
        let arr = JSON.parse(data);
        for (let ele of arr) {
            //添加一个block到layer1中
            this.layer_1_action.add_block_by_local_position(new Vec3(ele.x, ele.y));
        }
        //tips 提示导入成功
        EventDispatcher.get_target().emit(EventDispatcher.TIPS_MSG, "import success");
        this.update_block_size();
        //刷新 layer1中block的遮挡关系
        this.layer_1_action.refresh_shadow();
    }
    /**
     * 导出
     * @returns 
     */
    click_export() {
        //从 layer1 中获取所有block
        let children = this.layer_1_action.get_children();
        //判断数量，block数量必须是3的倍数，大于0个
        if (children.length % 3 != 0 || children.length == 0) {
            this.label_msg.string = "block size must be a multiple of 3";
            return;
        }
        let arr: any[] = [];
        for (let ele of children) {
            let pos = ele.getPosition();
            //把block位置信息放入数组中
            arr.push({ x: Math.ceil(pos.x), y: Math.ceil(pos.y) });
        }
        //把数组转换成字符串
        let ret = JSON.stringify(arr);
        //把字符串结果，放入到editbox中
        this.position_data.string = ret;
        //tips提示导出成功
        EventDispatcher.get_target().emit(EventDispatcher.TIPS_MSG, "export complete");

        this.copyHandle(this.position_data.string)
    }
    /**
     * 清理全部
     */
    click_clear_all() {
        //remove all
        this.layer_1_action.clear_all();
        this.update_block_size();
        EventDispatcher.get_target().emit(EventDispatcher.TIPS_MSG, "clear complete");
    }
    click_custom_grid() {
        let x = this.position_x.string;
        let y = this.position_y.string;
        this.node.parent.getChildByName("edit").getComponent(EditAction).add_grid(Number(x), Number(y), new Size(15, 15), Color.RED);
        this.node.parent.getChildByName("edit").getComponent(EditAction).addBlockByCustomPos(Number(x), Number(y))
    }
    /**
     * 更新label（block size）显示layer1中block的数量
     */
    update_block_size() {
        let size = this.layer_1_action.get_children().length;
        this.label_block_size.string = "" + size;
        let color = null;
        if (size % 3 == 0) {
            color = new Color(255, 255, 255, 255);
        } else {
            color = new Color(255, 0, 0, 255);
        }
        this.label_block_size.color = color;
    }

    /**
     * 设置显示鼠标的位置
     * @param x 
     * @param y 
     */
    set_pos(x: number, y: number) {
        this.label_position.string = x + "," + y;
    }

    onCopy_click() {
        this.copyHandle(this.position_data.string)
    }

    copyHandle(content) {
        let copy = (e) => {
            e.preventDefault()
            e.clipboardData.setData('text/plain', content)
            alert('数据导出并复制成功，请前往后台粘贴')
            document.removeEventListener('copy', copy)
        }
        document.addEventListener('copy', copy)
        document.execCommand("Copy");
    }
}

