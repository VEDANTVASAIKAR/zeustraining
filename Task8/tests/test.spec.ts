import {test,expect} from '@playwright/test'
import { ColumnDragSelectionTest } from '../testclasses/columndragselection.spec'
import { ColumnResizeTest } from '../testclasses/columnresize.spec'
import { ColumnSelectionTest } from '../testclasses/columnselection.spec'   
import { CtrlSelectionTest } from '../testclasses/ctrlselection.spec'   
import { KeyboardSelectionTest } from '../testclasses/keyboardselection.spec'
import { RowDragSelectionTest } from '../testclasses/rowdragselection.spec'
import { RowResizeTest } from '../testclasses/rowresize.spec'
import { RowSelectionTest } from '../testclasses/rowselection.spec'
import { cols } from '../scripts/script';
import { rows } from '../scripts/script';


test('Excel Testing', async ({ page }) => {

    await page.goto('http://127.0.0.1:5500/Task8/index.html');

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
        columnresize,
        columnselection,
        ctrlselection,
        keyboardselection,
        rowdragselection,
        rowresize,
        rowselection
    ];

    // for (const testobject of testObjects){
    //     await testobject.test()
    // }

    await columnresize.test()
    await columnresize.verifytest()
    await rowresize.test()
    await rowresize.verifytest()
    

})