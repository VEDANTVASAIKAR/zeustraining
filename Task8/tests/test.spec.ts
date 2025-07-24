import {test,expect} from '@playwright/test'
import { ColumnDragSelectionTest } from '../testclasses/columndragselection.spec'
import { ColumnResizeTest } from '../testclasses/columnresize.spec'
import { ColumnSelectionTest } from '../testclasses/columnselection.spec'   
import { CtrlSelectionTest } from '../testclasses/ctrlselection.spec'   
import { KeyboardSelectionTest } from '../testclasses/keyboardselection.spec'
import { RowDragSelectionTest } from '../testclasses/rowdragselection.spec'
import { RowResizeTest } from '../testclasses/rowresize.spec'
import { RowSelectionTest } from '../testclasses/rowselection.spec'



test('Excel Testing', async ({ page }) => {

    await page.goto('http://127.0.0.1:5501/Task8/index.html');

    const columndragselection : ColumnDragSelectionTest = new ColumnDragSelectionTest(page)
    const columnresize: ColumnResizeTest = new ColumnResizeTest(page);
    const columnselection: ColumnSelectionTest = new ColumnSelectionTest(page);
    const ctrlselection: CtrlSelectionTest = new CtrlSelectionTest(page);
    const keyboardselection: KeyboardSelectionTest = new KeyboardSelectionTest(page);
    const rowdragselection: RowDragSelectionTest = new RowDragSelectionTest(page);
    const rowresize: RowResizeTest = new RowResizeTest(page);
    const rowselection: RowSelectionTest = new RowSelectionTest(page);

    const testObjects = [
        columndragselection,
        columnselection,
        keyboardselection,
        rowdragselection,
        rowselection,
        columnresize,
        rowresize
        
    ];

    // for (const testobject of testObjects){
    //     await testobject.test()
    //     await testobject.verifytest()
    // }

    await columndragselection.test(270,1070);
    await columndragselection.verifytest();


    

})