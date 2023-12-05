import { Bindings, initializeBindings } from "@coveo/atomic";
import { Component, Element, h, Prop, State } from "@stencil/core";
import {
  TabState,
  Tab as HeadlessTab,
  TabOptions,
  TabProps,
  buildTab,
  Unsubscribe,
} from "@coveo/headless";

/**
 * Sample custom Atomic component, initializing itself against a parent search interface in order to retrieve the bindings.
 *
 * This component showcases a custom-made pagination component, for educational purposes.
 *
 * In a real life scenario, we recommend using either [atomic-pager](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-pager/) or [atomic-load-more-results](https://docs.coveo.com/en/atomic/latest/reference/components/atomic-load-more-results/) instead.
 */
@Component({
  tag: "custom-tab",
  styleUrl: "custom-tab.css",
  shadow: true,
})
export class CustomTab {
  @Prop() expression!: string;
  @Prop() label!: string;
  @Prop() isActive!: boolean;

  // ...
  // The Atomic bindings to be resolved on the parent atomic-search-interface.
  // Used to access the Headless engine in order to create controllers, dispatch actions, access state, etc.
  private bindings?: Bindings;

  // We recommend recording possible errors thrown during the configuration.
  private error?: Error;

  // Headless controller that contains the necessary methods.
  private tabController!: HeadlessTab;

  //...

  private tabUnsubscribe: Unsubscribe = () => {};

  @Element() private host!: Element;
  @State() private tabState!: TabState;

  public async connectedCallback() {
    try {
      // Initialize the Atomic bindings on your component.
      this.bindings = await initializeBindings(this.host);

      const options: TabOptions = {
        id: this.label,
        expression: this.expression,
      };
      const props: TabProps = {
        initialState: { isActive: this.isActive },
        options: options,
      };
      this.tabController = buildTab(this.bindings.engine, props);
      // Subscribe to controller state changes.
      this.tabUnsubscribe = this.tabController.subscribe(
        () => (this.tabState = this.tabController.state)
      );
    } catch (error) {
      console.error(error);
      this.error = error as Error;
    }
  }
  public disconnectedCallback() {
    this.tabUnsubscribe();
  }

  public render() {
    if (this.error) {
      return (
        <p>
          Error when initializing the component, please view the console for
          more information.
        </p>
      );
    }

    if (!this.bindings || !this.tabState) {
      return null;
    }

    return (
      <a
        onClick={() => this.tabController.select()}
        class={this.tabState.isActive ? "selected" : ""}
      >
        <p>{this.label}</p>
      </a>
    );
  }
}
