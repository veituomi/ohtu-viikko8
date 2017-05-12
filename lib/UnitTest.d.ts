/** Annotates a test class. */
declare function Testable(target: any): void;
/** Annotates a test method. */
declare function Test(target: any, propertyKey: string): void;
/** Adds a timeout value in the test method.
 * @param time Time in milliseconds.
*/
declare function Timeout(time: number): (target: any, propertyKey: string) => void;
/** Annotates that the test method should throw an exception to work properly. */
declare function ExpectException(target: any, propertyKey: string): void;
/** Annotates a method that is run every time before a test method. */
declare function Before(target: any, propertyKey: string): void;
/** Annotates a method that is run every time after a test method. */
declare function After(target: any, propertyKey: string): void;
/** Annotates a method that is run once before all test methods. */
declare function BeforeClass(target: any, propertyKey: string): void;
/** Annotates a method that is run once after all test methods. */
declare function AfterClass(target: any, propertyKey: string): void;
/** Annotates that the method is ignored when running tests. */
declare function Ignore(target: UnitTest, propertyKey: string): void;
interface TestConsole {
    info(message: string): any;
    log(message: string): any;
    error(message: string): any;
    hasErrors(): boolean;
}
declare abstract class UnitTest {
    fail(message: string): void;
    assertTrue(message: string, condition: boolean): void;
    assertFalse(message: string, condition: boolean): void;
    assertEquals(message: string, expected: any, actual: any, tolerance?: number): void;
    assertNull(message: string, object: Object): void;
    assertNotNull(message: string, object: Object): void;
    assertSame(message: string, expected: Object, actual: Object): void;
    assertNotSame(message: string, expected: Object, actual: Object): void;
}
