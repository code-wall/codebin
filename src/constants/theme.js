import Colors from 'material-ui/lib/styles/colors';
import ColorManipulator from 'material-ui/lib/utils/color-manipulator';
import Spacing from 'material-ui/lib/styles/spacing';
import zIndex from 'material-ui/lib/styles/zIndex';

export default {
    spacing: Spacing,
    zIndex: zIndex,
    fontFamily: 'Roboto, sans-serif',
    palette: {
        primary1Color: Colors.orange800,
        //primary2Color: Colors.cyan700,
        //primary3Color: Colors.lightBlack,
        //accent1Color: Colors.pinkA200,
        //accent2Color: Colors.grey100,
        //accent3Color: Colors.grey500,
        textColor: Colors.white,
        alternateTextColor: Colors.white,
        canvasColor: "#041B22",
        borderColor: "#004b56"
        //disabledColor: ColorManipulator.fade(Colors.darkBlack, 0.3),
        //pickerHeaderColor: Colors.cyan500,
    }
};