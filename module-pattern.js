
function createObj() {
    let money = 0;
    return {
        withdraw() {
            money = money - 10
        },
        getMoney() {
            return money;
        }
    }
}

const obj = createObj();
const obj2 = createObj();
const obj3 = createObj();

obj.money
obj.withdraw()

obj.money