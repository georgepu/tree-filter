import { rawData } from './data.js';

const treeContainer = document.querySelector('#tree');
let newDataMap = {};
const newData = transformData(rawData);
let filterMode = false;
console.log(newData);

createTree(treeContainer, newData);

document.querySelector('#generateButton').addEventListener('click', () => {
  const cloneData = JSON.parse(JSON.stringify(newData));
  const filteredTreeData = filterTree(cloneData);
  if (filteredTreeData.length) {
    if (filterMode) {
      treeContainer.removeChild(treeContainer.lastChild);
    } else {
      filterMode = true;
    }
    filteredTreeData[0].name = 'Filtered By';
    createTree(treeContainer, filteredTreeData, 'filtered');
  }
});

//transform raw data structure
function transformData(data) {
  const root = [];
  const dataMap = {};
  rawData.forEach((data) => {
    dataMap[data.id] = {
      ...data,
      children: [],
      isChecked: false,
    };
  });
  rawData.forEach((data) => {
    if (data.parent > 0) {
      dataMap[data.parent].children.push(dataMap[data.id]);
      // dataMap[data.id].parent = dataMap[data.parent];
    } else {
      root.push(dataMap[data.id]);
    }
  });
  newDataMap = dataMap;
  return root;
}

//display transformed tree structure
function createTree(parent, items, name = 'original') {
  const ul = document.createElement('ul');
  parent.appendChild(ul);

  items.forEach((item) => {
    const li = document.createElement('li');
    ul.appendChild(li);
    //add checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.name = name;
    checkbox.checked = item.isChecked;
    name === 'original' && checkbox.addEventListener('change', event => {
      item.isChecked = !item.isChecked;
      reEvalTreeCheckbox(item);//update isChecked value for the whole chain from root node, then re-create tree to update DOM
    });
    item.parent && li.appendChild(checkbox);
    //add label name text
    const span = document.createElement('span');
    span.textContent = item.name;
    li.appendChild(span);
    //add total count
    const totalSpan = document.createElement('span');
    totalSpan.classList.add('total-span');
    if (name === 'filtered') {
      if (item.isChecked) {
        if (item.children.length) {
          totalSpan.textContent = `${getTotalCheckedCount(item) - 1}`;
        }
      } else if (item.children.length) {
        totalSpan.textContent = `${getTotalCheckedCount(item)}`;
      }
    } else {
      totalSpan.textContent = `${item.children.length}`;
    }
    item.children.length && li.appendChild(totalSpan);
    //add toggle symbols, up arrow indicates expanded, down arrow collapsed
    const toggle = document.createElement('span');
    toggle.classList.add('tree-toggle');
    //hide or display children on toggle clicks
    if (item.children.length > 0) {
      li.appendChild(toggle);
      item.isExpanded && toggle.classList.toggle('expanded');
      const childUl = createTree(li, item.children, name);
      childUl.style.display = item.isExpanded ? 'block' : 'none';
    }
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('expanded');
      item.isExpanded = !item.isExpanded;
      const childUl = li.querySelector('ul');
      if (childUl) {
        childUl.style.display = item.isExpanded ? 'block' : 'none';
      }
    });
  });
  return ul;
}

//upon clicking the generate btn
function filterTree(treeData) {
  const filteredData = treeData.filter((row) => {
    if (row.children.length) {
      row.children = filterTree(row.children);
    }
    return row.isChecked || row.children.length > 0;
  });
  return filteredData;
}

//filtered list needs to show total number of checked children nodes at parent level
function getTotalCheckedCount(item) {
  let totalCount = item.isChecked ? 1 : 0;
  item.children.forEach((child) => {
    totalCount += getTotalCheckedCount(child);
  });
  return totalCount;
}

function checkNestedChildren(children, isParentChecked) {
  children.length && children.forEach(node => {
    node.isChecked = isParentChecked;
    checkNestedChildren(node.children, node.isChecked);
  })
}

function checkNestedParent(parent) {
  const current = newDataMap[parent], papa = current.parent;
  current.isChecked = current.children.every(node => node.isChecked);
  papa > 1 && checkNestedParent(papa);
}

function reEvalTreeCheckbox(item) {
  checkNestedChildren(item.children, item.isChecked);
  checkNestedParent(item.parent);
  // below two-liner updates original tree on the screen
  treeContainer.removeChild(treeContainer.firstChild);
  createTree(treeContainer, newData);
  reOrder();
}

function reOrder() {
  const childNodes = treeContainer.childNodes;
  childNodes.length > 1 && treeContainer.insertBefore(childNodes[1], childNodes[0]);
}


